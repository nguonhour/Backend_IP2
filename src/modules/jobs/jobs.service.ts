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
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { JobCategory } from '../../entities/master/job-category.entity';
import { JobType } from '../../entities/master/job-type.entity';
import { JobStatus } from '../../entities/master/job-status.entity';

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
  ) {}

  async getAllJobs() {
    return this.jobRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['category', 'jobType', 'status', 'employer'],
    });
  }

  async getJobById(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['category', 'jobType', 'status', 'employer'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
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

    return this.jobRepository.find({
      where: { employer: { id: employer.id } },
      relations: ['category', 'jobType', 'status', 'employer'],
      order: { createdAt: 'DESC' },
    });
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

    Object.assign(job, {
      title: dto.title ?? job.title,
      description: dto.description ?? job.description,
      requirements: dto.requirements ?? job.requirements,
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
      const status = await this.jobStatusRepository.findOne({
        where: { id: dto.statusId },
      });
      if (!status) {
        throw new NotFoundException('Job status not found');
      }
    }
  }
}
