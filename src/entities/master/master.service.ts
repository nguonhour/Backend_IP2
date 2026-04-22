import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobStatus } from './job-status.entity';
import { ApplicationStatus } from './application-status.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(JobStatus)
    private jobStatusRepository: Repository<JobStatus>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
  ) {}

  async getJobStatuses() {
    return this.jobStatusRepository.find({
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
}
