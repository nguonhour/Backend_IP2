import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Skill } from '../../entities/master/skill.entity';
import { Industry } from '../../entities/master/industry.entity';
import { Language } from '../../entities/master/language.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';

type MasterResource = 'skills' | 'industries' | 'languages' | 'universities' | 'majors';

type MasterEntity = Skill | Industry | Language | University | Major;

type MasterRow = {
  name: string;
  isActive: boolean;
};

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {}

  async list(resource: MasterResource): Promise<MasterEntity[]> {
    return this.getRepository(resource).find({ order: { name: 'ASC' } });
  }

  async create(resource: MasterResource, name: string, isActive = true): Promise<MasterEntity> {
    const repository = this.getRepository(resource);
    const normalizedName = this.normalizeName(name);

    await this.ensureUniqueName(repository, normalizedName);

    const entity = repository.create({ name: normalizedName, isActive } as MasterRow);
    return (await repository.save(entity as never)) as unknown as MasterEntity;
  }

  async update(
    resource: MasterResource,
    id: string,
    input: { name?: string; isActive?: boolean },
  ): Promise<MasterEntity> {
    const repository = this.getRepository(resource);
    const entity = await repository.findOne({ where: { id } as never });

    if (!entity) {
      throw new NotFoundException(`${this.label(resource)} not found`);
    }

    if (input.name !== undefined) {
      const normalizedName = this.normalizeName(input.name);
      await this.ensureUniqueName(repository, normalizedName, id);
      (entity as { name: string }).name = normalizedName;
    }

    if (input.isActive !== undefined) {
      (entity as { isActive: boolean }).isActive = input.isActive;
    }

    return (await repository.save(entity as never)) as unknown as MasterEntity;
  }

  async remove(resource: MasterResource, id: string): Promise<{ message: string }> {
    await this.update(resource, id, { isActive: false });
    return { message: `${this.label(resource)} deactivated` };
  }

  private getRepository(resource: MasterResource): Repository<any> {
    switch (resource) {
      case 'skills':
        return this.skillRepository;
      case 'industries':
        return this.industryRepository;
      case 'languages':
        return this.languageRepository;
      case 'universities':
        return this.universityRepository;
      case 'majors':
        return this.majorRepository;
      default:
        throw new NotFoundException('Master data category not found');
    }
  }

  private async ensureUniqueName(
    repository: Repository<any>,
    name: string,
    excludeId?: string,
  ) {
    const existing = await repository.findOne({
      where: { name } as never,
    });

    if (existing && (!excludeId || (existing as { id: string }).id !== excludeId)) {
      throw new ConflictException(`${name} already exists`);
    }
  }

  private normalizeName(name: string) {
    const normalized = String(name ?? '').trim();

    if (!normalized) {
      throw new ConflictException('Name is required');
    }

    return normalized;
  }

  private label(resource: MasterResource) {
    switch (resource) {
      case 'skills':
        return 'Skill';
      case 'industries':
        return 'Industry';
      case 'languages':
        return 'Language';
      case 'universities':
        return 'University';
      case 'majors':
        return 'Major';
      default:
        return 'Item';
    }
  }
}