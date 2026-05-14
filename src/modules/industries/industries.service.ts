import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../../entities/master/industry.entity';

@Injectable()
export class IndustriesService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async getIndustries() {
    return this.industryRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getIndustryById(id: string) {
    const industry = await this.industryRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'name'],
    });

    if (!industry) {
      throw new NotFoundException('Industry not found');
    }

    return industry;
  }
}
