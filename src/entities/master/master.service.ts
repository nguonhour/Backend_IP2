import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { JobStatus } from './job-status.entity';
import { ApplicationStatus } from './application-status.entity';
import { University } from './university.entity';
import { Major } from './major.entity';
import { JobCategory } from './job-category.entity';
import { JobType } from './job-type.entity';
import { Language } from './language.entity';

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
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
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
    return this.applicationStatusRepository
      .createQueryBuilder('status')
      .select(['status.id', 'status.name'])
      .where('status.isActive = :isActive', { isActive: true })
      .orderBy(
        `CASE LOWER(status.name)
          WHEN 'applied' THEN 1
          WHEN 'shortlisted' THEN 3
          WHEN 'interview scheduled' THEN 4
          WHEN 'interview completed' THEN 5
          WHEN 'hired' THEN 6
          WHEN 'rejected' THEN 7
          ELSE 99
        END`,
        'ASC',
      )
      .addOrderBy('status.name', 'ASC')
      .getMany();
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

  async getLanguages() {
    return this.languageRepository.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }
}
