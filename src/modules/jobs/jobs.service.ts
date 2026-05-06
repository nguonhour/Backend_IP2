import {
  BadRequestException,
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
import { JobSearchDto } from './dto/search-job.dto';
import { Payment } from '../payments/payment.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';

const PUBLIC_JOB_STATUS_NAMES = ['published', 'active', 'open'];

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
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async getAllJobs() {
    const jobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .where('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    return jobs.map((job) => ({
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
      .loadRelationCountAndMap('job.applicantsCount', 'job.applications')
      .loadRelationCountAndMap('job.viewsCount', 'job.views')
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
      .loadRelationCountAndMap('job.viewsCount', 'job.views')
      .where('employer.id = :employerId', { employerId: employer.id })
      .orderBy('job.createdAt', 'DESC')
      .getMany();
    return jobs.map((job) => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));
  }

  async getMyPostedJobById(userId: string, id: string) {
    const employer = await this.getEmployerProfileByUserId(userId);

    const job = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .loadRelationCountAndMap('job.applicantsCount', 'job.applications')
      .loadRelationCountAndMap('job.viewsCount', 'job.views')
      .where('job.id = :id', { id })
      .andWhere('employer.id = :employerId', { employerId: employer.id })
      .getOne();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    };
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
      summary: dto.summary ?? job.summary,
      benefits: dto.benefits ?? job.benefits,
      imageUrl: dto.imageUrl ?? job.imageUrl,
      location: dto.location ?? job.location,
      salaryMin: dto.salaryMin ?? job.salaryMin,
      salaryMax: dto.salaryMax ?? job.salaryMax,
      currency: dto.currency ?? job.currency,
      numberOfOpenings: dto.numberOfOpenings ?? job.numberOfOpenings,
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

    const applicationsCount = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.applications', 'application')
      .where('job.id = :id', { id: job.id })
      .select('COUNT(application.id)', 'count')
      .getRawOne<{ count: string }>();

    if (Number(applicationsCount?.count ?? 0) > 0) {
      throw new BadRequestException(
        'Cannot delete this job because it already has applications. Please close the job instead.',
      );
    }

    // Keep payment records while detaching the deleted job reference.
    await this.paymentRepository
      .createQueryBuilder()
      .update(Payment)
      .set({ job: null as unknown as Payment['job'] })
      .where('job_id = :jobId', { jobId: job.id })
      .execute();

    await this.jobHistoryRepository
      .createQueryBuilder()
      .delete()
      .from(JobHistory)
      .where('job_id = :jobId', { jobId: job.id })
      .execute();

    await this.jobRepository.remove(job);
    return { message: 'Job deleted successfully' };
  }
  async getMatchBySkills(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['studentSkills', 'studentSkills.skill'],
    });

    if (!student) throw new NotFoundException('Student profile not found');

    const skillIds = student.studentSkills.map((s) => s.skill.id);
    if (skillIds.length === 0) return [];

    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.jobSkills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.category', 'category')
      .where('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .andWhere('skill.id IN (:...skillIds)', { skillIds })
      .orderBy('job.createdAt', 'DESC')
      .getMany();
  }

  async getMatchByMajor(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['major'],
    });

    if (!student) throw new NotFoundException('Student profile not found');
    if (!student.major) return [];

    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .where('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .andWhere('LOWER(category.name) LIKE :major', {
        major: `%${student.major.name.toLowerCase()}%`,
      })
      .orderBy('job.createdAt', 'DESC')
      .getMany();
  }

  async getRecommendedJobs(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'studentSkills',
        'studentSkills.skill',
        'major',
        'applications',
        'applications.job',
        'applications.job.category',
        'savedJobs',
        'savedJobs.job',
        'savedJobs.job.category',
      ],
    });

    if (!student) throw new NotFoundException('Student profile not found');

    const categoryIds = new Set<string>();
    student.applications?.forEach((a) => {
      if (a.job?.category?.id) categoryIds.add(a.job.category.id);
    });
    student.savedJobs?.forEach((s) => {
      if (s.job?.category?.id) categoryIds.add(s.job.category.id);
    });

    const skillIds = student.studentSkills?.map((s) => s.skill.id) ?? [];

    if (categoryIds.size === 0 && skillIds.length === 0) {
      return this.getAllJobs();
    }

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.jobSkills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
      .where('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())');

    if (categoryIds.size > 0 && skillIds.length > 0) {
      qb.andWhere(
        '(category.id IN (:...categoryIds) OR skill.id IN (:...skillIds))',
        { categoryIds: [...categoryIds], skillIds },
      );
    } else if (categoryIds.size > 0) {
      qb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: [...categoryIds],
      });
    } else {
      qb.andWhere('skill.id IN (:...skillIds)', { skillIds });
    }

    return qb.orderBy('job.createdAt', 'DESC').getMany();
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
      throw new ForbiddenException(
        'You do not have permission to modify this job',
      );
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
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
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
