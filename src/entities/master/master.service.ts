import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { JobStatus } from './job-status.entity';
import { ApplicationStatus } from './application-status.entity';
import { University } from './university.entity';
import { Major } from './major.entity';
import { JobCategory } from './job-category.entity';
import { JobType } from './job-type.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(JobCategory)
    private jobCategoryRepository: Repository<JobCategory>,
    @InjectRepository(JobType)
    private jobTypeRepository: Repository<JobType>,
    @InjectRepository(JobStatus)
    private jobStatusRepository: Repository<JobStatus>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    @InjectRepository(University)
    private universityRepository: Repository<University>,
    @InjectRepository(Major)
    private majorRepository: Repository<Major>,
  ) {}

  async getJobStatuses() {
    return this.jobStatusRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getJobCategories() {
    return this.jobCategoryRepository.find({
      where: { isActive: true, employer: IsNull() },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getJobTypes() {
    return this.jobTypeRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getApplicationStatuses() {
    return this.applicationStatusRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getUniversities() {
    return this.universityRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getMajors() {
    return this.majorRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }
}
