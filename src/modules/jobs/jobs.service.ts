import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { JobCategory } from '../../entities/master/job-category.entity';
import { JobType } from '../../entities/master/job-type.entity';
import { JobStatus } from '../../entities/master/job-status.entity';
import { JobHistory } from './job-history.entity';

const PUBLIC_JOB_STATUS_NAMES = ['published', 'active', 'open'];
const CLOSED_JOB_STATUS_NAMES = ['closed', 'filled', 'expired', 'draft', 'paused'];
import { JobSearchDto } from './dto/search-job.dto';


@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(EmployerProfile)
    private employerProfileRepository: Repository<EmployerProfile>,
    @InjectRepository(JobCategory)
    private jobCategoryRepository: Repository<JobCategory>,
    @InjectRepository(JobType)
    private jobTypeRepository: Repository<JobType>,
    @InjectRepository(JobStatus)
    private jobStatusRepository: Repository<JobStatus>,
    @InjectRepository(JobHistory)
    private jobHistoryRepository: Repository<JobHistory>,
  ) {}

  async getAllJobs() {
    const jobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      // .where('LOWER(status.name) IN (:...visibleStatuses)', {
      //   visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      // })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    return jobs.map(job => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));
  }

  async getJobById(id: string) {
    const job = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .where('job.id = :id', { id })
      .andWhere('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .getOne();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return {
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    };
  }

  async createJob(userId: string, dto: CreateJobDto) {
    const employer = await this.getEmployerProfileByUserId(userId);
    await this.assertJobRelationsExist(dto);
    const job = this.jobRepository.create({
      ...dto,
      employer: { id: employer.id },
      category: dto.categoryId ? { id: dto.categoryId } : undefined,
      jobType: dto.jobTypeId ? { id: dto.jobTypeId } : undefined,
      status: dto.statusId ? { id: dto.statusId } : undefined,
    });

    return this.jobRepository.save(job);
  }

  async getMyPostedJobs(userId: string) {
    const employer = await this.getEmployerProfileByUserId(userId);

    const jobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .loadRelationCountAndMap('job.applicantsCount', 'job.applications')
      .where('employer.id = :employerId', { employerId: employer.id })
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    return jobs.map(job => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));
  }

  async updateJob(userId: string, id: string, dto: UpdateJobDto) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    this.ensureEmployerOwnsJob(job, userId);
    await this.assertJobRelationsExist(dto);
    await this.recordJobHistory(job);

    Object.assign(job, {
      title: dto.title ?? job.title,
      description: dto.description ?? job.description,
      // requirements: dto.requirements ?? job.requirements,
      benefits: dto.benefits ?? job.benefits,
      imageUrl: dto.imageUrl ?? job.imageUrl,
      location: dto.location ?? job.location,
      salaryMin: dto.salaryMin ?? job.salaryMin,
      salaryMax: dto.salaryMax ?? job.salaryMax,
      currency: dto.currency ?? job.currency,
      deadline: dto.deadline ? new Date(dto.deadline) : job.deadline,
      category: dto.categoryId
        ? ({ id: dto.categoryId } as Job['category'])
        : job.category,
      jobType: dto.jobTypeId
        ? ({ id: dto.jobTypeId } as Job['jobType'])
        : job.jobType,
      status: dto.statusId
        ? ({ id: dto.statusId } as Job['status'])
        : job.status,
      updatedAt: new Date(),
    });

    await this.jobRepository.save(job);
    return this.jobRepository.findOne({
      where: { id },
      relations: ['category', 'jobType', 'status', 'employer'],
    });
  }

  async updateJobStatus(userId: string, id: string, dto: UpdateJobStatusDto) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    this.ensureEmployerOwnsJob(job, userId);
    await this.assertJobStatusExists(dto.statusId);
    await this.recordJobHistory(job);

    job.status = { id: dto.statusId } as Job['status'];
    job.updatedAt = new Date();

    await this.jobRepository.save(job);

    return this.jobRepository.findOne({
      where: { id },
      relations: ['category', 'jobType', 'status', 'employer'],
    });
  }

  async deleteJob(userId: string, id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['employer', 'employer.user'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    this.ensureEmployerOwnsJob(job, userId);

    await this.jobRepository.remove(job);
    return { message: 'Job deleted successfully' };
  }

  private async getEmployerProfileByUserId(userId: string) {
    const employer = await this.employerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!employer) {
      throw new NotFoundException('Employer profile not found');
    }

    return employer;
  }

  private ensureEmployerOwnsJob(job: Job, userId: string) {
    if (job.employer?.user?.id !== userId) {
      throw new ForbiddenException('You do not have permission to modify this job');
    }
  }

  private async assertJobRelationsExist(
    dto: Pick<CreateJobDto, 'categoryId' | 'jobTypeId' | 'statusId'>,
  ) {
    if (dto.categoryId) {
      const category = await this.jobCategoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Job category not found');
      }
    }

    if (dto.jobTypeId) {
      const jobType = await this.jobTypeRepository.findOne({
        where: { id: dto.jobTypeId },
      });
      if (!jobType) {
        throw new NotFoundException('Job type not found');
      }
    }

    if (dto.statusId) {
      await this.assertJobStatusExists(dto.statusId);
    }
  }

  private async assertJobStatusExists(statusId: string) {
    const status = await this.jobStatusRepository.findOne({
      where: { id: statusId },
    });
    if (!status) {
      throw new NotFoundException('Job status not found');
    }
  }

  private async recordJobHistory(job: Job) {
    await this.jobHistoryRepository.save(
      this.jobHistoryRepository.create({
        job: { id: job.id },
        title: job.title,
        description: job.description,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
      }),
    );
  }

    async searchJobs(query: JobSearchDto) {
        const { keyword, location, type, minSalary } = query;
        const qb = this.jobRepository
            .createQueryBuilder('job')
            .leftJoin('job.jobType', 'jobType');

        if (keyword) {
            qb.andWhere(
                '(job.title ILIKE :keyword OR job.description ILIKE :keyword)',
                { keyword: `%${keyword}%` },
            );
        }

        if (location) {
            qb.andWhere('job.location = :location', { location });
        }

        if (type) {
            qb.andWhere('jobType.name = :type', { type });
        }

        if (minSalary) {
            qb.andWhere('job.salaryMin >= :minSalary', { minSalary });
        }

        return await qb.getMany();
    }
}
