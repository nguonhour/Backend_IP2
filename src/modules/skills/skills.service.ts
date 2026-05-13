import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../entities/master/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async getSkills() {
    return this.skillRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getSkillById(id: string) {
    const skill = await this.skillRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'name'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }
}
