import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import { ApplicationStatusHistory } from '../applications/application-status-history.entity';

@Injectable()
export class ApplicationManagementService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationStatusHistory)
    private applicationStatusHistoryRepository: Repository<ApplicationStatusHistory>,
  ) {}

  async findAllApplications(
    filters?: {
      status?: string;
      employerId?: string;
      employerName?: string;
      studentId?: string;
      jobId?: string;
    },
    page = 1,
    limit = 10,
  ) {
    const query = this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.user', 'employerUser')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('student.educations', 'educations')
      .leftJoinAndSelect('application.resume', 'resume');

    if (filters?.status) {
      query.andWhere('LOWER(status.name) = LOWER(:status)', {
        status: filters.status,
      });
    }

    if (filters?.employerId) {
      query.andWhere('employer.id = :employerId', {
        employerId: filters.employerId,
      });
    }

    if (filters?.employerName) {
      query.andWhere('LOWER(employer.companyName) LIKE LOWER(:employerName)', {
        employerName: `%${filters.employerName}%`,
      });
    }

    if (filters?.studentId) {
      query.andWhere('student.id = :studentId', {
        studentId: filters.studentId,
      });
    }

    if (filters?.jobId) {
      query.andWhere('job.id = :jobId', {
        jobId: filters.jobId,
      });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await query
      .orderBy('application.appliedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getApplicationById(id: string) {
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.user', 'employerUser')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('application.resume', 'resume')
      .leftJoinAndSelect('application.statusHistory', 'statusHistory')
      .leftJoinAndSelect('statusHistory.status', 'historyStatus')
      .leftJoinAndSelect('statusHistory.changedBy', 'changedBy')
      .where('application.id = :id', { id })
      .orderBy('statusHistory.changedAt', 'DESC')
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async getApplicationHistory(applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationStatusHistoryRepository
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.status', 'status')
      .leftJoinAndSelect('history.changedBy', 'changedBy')
      .where('history.application = :applicationId', { applicationId })
      .orderBy('history.changedAt', 'DESC')
      .getMany();
  }
}
