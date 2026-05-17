import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerProfile } from './employer-profile.entity';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { CreateEmployerCategoryDto } from './dto/create-employer-category.dto';
import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';
import { JobCategory } from '../../entities/master/job-category.entity';

@Injectable()
export class EmployerProfilesService {
  constructor(
    @InjectRepository(EmployerProfile)
    private employerProfileRepository: Repository<EmployerProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Industry)
    private industryRepository: Repository<Industry>,
    @InjectRepository(JobCategory)
    private jobCategoryRepository: Repository<JobCategory>,
  ) {}

  async create(userId: string, dto: CreateEmployerProfileDto) {
    const existingProfile = await this.employerProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingProfile) {
      throw new ConflictException('Employer profile already exists');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.industryId) {
      const industry = await this.industryRepository.findOne({
        where: { id: dto.industryId },
      });
      if (!industry) {
        throw new NotFoundException('Industry not found');
      }
    }

    const profile = this.employerProfileRepository.create({
      companyName: dto.companyName,
      location: dto.location,
      contactEmail: dto.contactEmail,
      avatarUrl: dto.avatarUrl,
      about: dto.about,
      companySize: dto.companySize,
      foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : undefined,
      website: dto.website,
      phone: dto.phone,
      user: { id: user.id },
      industry: dto.industryId
        ? ({ id: dto.industryId } as Industry)
        : undefined,
    });

    const savedProfile = await this.employerProfileRepository.save(profile);
    return this.findById(savedProfile.id);
  }

  async findByUserId(userId: string) {
    return this.withJobCategories(await this.findEntityByUserId(userId));
  }

  async findById(id: string) {
    const profile = await this.employerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'industry'],
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return this.withJobCategories(profile);
  }

  async update(userId: string, dto: UpdateEmployerProfileDto) {
    const profile = await this.findEntityByUserId(userId);
    const has = (key: keyof UpdateEmployerProfileDto) =>
      Object.prototype.hasOwnProperty.call(dto, key);

    if (dto.industryId) {
      const industry = await this.industryRepository.findOne({
        where: { id: dto.industryId },
      });
      if (!industry) {
        throw new NotFoundException('Industry not found');
      }
    }

    Object.assign(profile, {
      companyName: has('companyName') ? dto.companyName : profile.companyName,
      location: has('location') ? dto.location : profile.location,
      contactEmail: has('contactEmail') ? dto.contactEmail : profile.contactEmail,
      avatarUrl: has('avatarUrl') ? dto.avatarUrl : profile.avatarUrl,
      about: has('about') ? dto.about : profile.about,
      companySize: has('companySize') ? dto.companySize : profile.companySize,
      foundedAt: has('foundedAt')
        ? dto.foundedAt
          ? new Date(dto.foundedAt)
          : null
        : profile.foundedAt,
      website: has('website') ? dto.website : profile.website,
      phone: has('phone') ? dto.phone : profile.phone,
      industry: dto.industryId
        ? ({ id: dto.industryId } as Industry)
        : profile.industry,
      updatedAt: new Date(),
    });

    await this.employerProfileRepository.save(profile);
    return this.findByUserId(userId);
  }

  async delete(userId: string) {
    const profile = await this.findEntityByUserId(userId);
    await this.employerProfileRepository.remove(profile);
    return { message: 'Employer profile deleted successfully' };
  }

  async getCategories(userId: string) {
    const employer = await this.findEntityByUserId(userId);

    return this.jobCategoryRepository.find({
      where: { employer: { id: employer.id }, isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async createCategory(userId: string, dto: CreateEmployerCategoryDto) {
    const employer = await this.findEntityByUserId(userId);
    const name = dto.name.trim();
    const existing = await this.jobCategoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.employer', 'employer')
      .where('employer.id = :employerId', { employerId: employer.id })
      .andWhere('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.jobCategoryRepository.save(existing);
      }

      return existing;
    }

    const category = this.jobCategoryRepository.create({
      name,
      employer: { id: employer.id } as EmployerProfile,
      isActive: true,
    });

    return this.jobCategoryRepository.save(category);
  }

  async deleteCategory(userId: string, categoryId: string) {
    const employer = await this.findEntityByUserId(userId);
    const category = await this.jobCategoryRepository.findOne({
      where: { id: categoryId, employer: { id: employer.id } },
      relations: ['jobs'],
    });

    if (!category) {
      throw new NotFoundException('Job category not found');
    }

    if (category.jobs?.length) {
      throw new ConflictException(
        'This category is already used by jobs and cannot be deleted.',
      );
    }

    await this.jobCategoryRepository.remove(category);
    return { message: 'Job category deleted successfully' };
  }

  private async findEntityByUserId(userId: string) {
    const profile = await this.employerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'industry'],
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return profile;
  }

  private async withJobCategories(profile: EmployerProfile) {
    const categories = await this.jobCategoryRepository.find({
      where: { employer: { id: profile.id }, isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    return {
      ...profile,
      isVerified: profile.user?.isVerified ?? false,
      categories,
    };
  }
}
