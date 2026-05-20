import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../job.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class JobsRepository extends BaseRepository<Job> {
  constructor(
    @InjectRepository(Job)
    jobRepository: Repository<Job>,
  ) {
    super(jobRepository);
  }

  async findByEmployerId(employerId: string, relations?: string[]) {
    try {
      return await this.repository.find({
        where: { employer: { id: employerId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByEmployerId', error, { employerId });
    }
  }

  async findActive(relations?: string[]) {
    try {
      return await this.repository.find({
        where: { isActive: true } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findActive', error, { relations });
    }
  }

  async findByCategory(categoryId: string, relations?: string[]) {
    try {
      return await this.repository.find({
        where: { category: { id: categoryId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByCategory', error, { categoryId });
    }
  }

  async findByLocation(location: string, relations?: string[]) {
    try {
      return await this.repository.find({
        where: { location } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByLocation', error, { location });
    }
  }
}
