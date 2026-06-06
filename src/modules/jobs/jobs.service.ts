import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  // Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { Job } from './job.entity';
import { JobApprovalStatus } from './job-approval-status.enum';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { JobCategory } from '../../entities/master/job-category.entity';
import { JobType } from '../../entities/master/job-type.entity';
import { JobStatus } from '../../entities/master/job-status.entity';
import { JobHistory } from './job-history.entity';
import { JobSearchDto } from './dto/search-job.dto';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { PaginationDto } from './dto/pagination-job.dto';

const PUBLIC_JOB_STATUS_NAMES = ['published', 'active', 'open'];
const PUBLIC_JOB_APPROVAL_STATUSES = [JobApprovalStatus.APPROVED];

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
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
  ) {}

  private escapeCsvValue(value: unknown) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  private parseLocalDate(value?: string | null): Date | null {
    if (!value) return null;
    const normalized = value.slice(0, 10);
    const [year, month, day] = normalized.split('-').map(Number);
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  private assertDeadlineIsNotBeforeToday(deadline?: string | null) {
    const deadlineDate = this.parseLocalDate(deadline);
    if (!deadlineDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      throw new BadRequestException(
        'Application deadline cannot be earlier than today.',
      );
    }
  }

  private applyPublicJobVisibilityFilters(
    queryBuilder: SelectQueryBuilder<Job>,
  ) {
    return queryBuilder
      .andWhere('LOWER(status.name) IN (:...visibleStatuses)', {
        visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
      })
      .andWhere('job.approvalStatus IN (:...visibleApprovalStatuses)', {
        visibleApprovalStatuses: PUBLIC_JOB_APPROVAL_STATUSES,
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
      .andWhere('COALESCE(job.is_blocked, false) IS FALSE');
  }

  async getAllJobs(paginationDto: PaginationDto) {
    const { page, limit, deadlineSort } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .skip(skip)
      .take(limit);

    this.applyPublicJobVisibilityFilters(queryBuilder);
    if (deadlineSort) {
      queryBuilder
        .orderBy(
          'job.deadline',
          deadlineSort.toUpperCase() as 'ASC' | 'DESC',
          'NULLS LAST',
        )
        .addOrderBy('job.createdAt', 'DESC');
    } else {
      queryBuilder.orderBy('job.createdAt', 'DESC');
    }

    const [jobs, total] = await queryBuilder.getManyAndCount();

    const mappedJobs = jobs.map((job) => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));

    return {
      data: mappedJobs,
      meta: {
        totalItems: total,
        itemCount: mappedJobs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // For Admin
  async getAllJobsForAdmin(paginationDto: PaginationDto) {
    const { page, limit, deadlineSort } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .skip(skip)
      .take(limit);

    if (deadlineSort) {
      queryBuilder
        .orderBy(
          'job.deadline',
          deadlineSort.toUpperCase() as 'ASC' | 'DESC',
          'NULLS LAST',
        )
        .addOrderBy('job.createdAt', 'DESC');
    } else {
      queryBuilder.orderBy('job.createdAt', 'DESC');
    }

    const [jobs, total] = await queryBuilder.getManyAndCount();

    const mappedJobs = jobs.map((job) => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));

    return {
      data: mappedJobs,
      meta: {
        totalItems: total,
        itemCount: mappedJobs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // For Admin
  async setJobBlocked(id: string, blocked: boolean) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['category', 'jobType', 'status', 'employer'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    job.is_blocked = blocked;
    job.updatedAt = new Date();

    await this.jobRepository.save(job);

    return job;
  }

  async getJobByIdForAdmin(id: string) {
    const job = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .loadRelationCountAndMap('job.applicantsCount', 'job.applications')
      .loadRelationCountAndMap('job.viewsCount', 'job.views')
      .where('job.id = :id', { id })
      .getOne();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    };
  }

  async getJobCategories() {
    return this.jobCategoryRepository.find({
      where: { isActive: true, employer: IsNull() },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async getJobById(id: string) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .loadRelationCountAndMap('job.applicantsCount', 'job.applications')
      .loadRelationCountAndMap('job.viewsCount', 'job.views')
      .where('job.id = :id', { id });

    this.applyPublicJobVisibilityFilters(queryBuilder);

    const job = await queryBuilder.getOne();
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

    // Check job posting limit
    const activeJobCount = await this.jobRepository.count({
      where: {
        employer: { id: employer.id },
        status: { name: 'active' },
      },
    });

    // If limit is not unlimited (-1) and already reached the limit
    if (
      employer.jobPostLimit &&
      employer.jobPostLimit !== -1 &&
      activeJobCount >= employer.jobPostLimit
    ) {
      throw new ForbiddenException(
        `You have reached the maximum job posting limit of ${employer.jobPostLimit} for your current plan. Please upgrade your plan to post more jobs.`,
      );
    }

    this.assertDeadlineIsNotBeforeToday(dto.deadline);
    await this.assertJobRelationsExist(dto, employer.id);
    const job = this.jobRepository.create({
      ...dto,
      employer: { id: employer.id },
      category: dto.categoryId ? { id: dto.categoryId } : undefined,
      jobType: dto.jobTypeId ? { id: dto.jobTypeId } : undefined,
      status: dto.statusId ? { id: dto.statusId } : undefined,
      approvalStatus: JobApprovalStatus.APPROVED,
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
    this.assertDeadlineIsNotBeforeToday(dto.deadline);
    await this.assertJobRelationsExist(dto, job.employer.id);
    await this.recordJobHistory(job);

    Object.assign(job, {
      title: dto.title ?? job.title,
      description: dto.description ?? job.description,
      // requirements: dto.requirements ?? job.requirements,
      summary: dto.summary ?? job.summary,
      benefits: dto.benefits ?? job.benefits,
      imageUrl: dto.imageUrl ?? job.imageUrl,
      location: dto.location ?? job.location,
      latitude: dto.latitude ?? job.latitude,
      longitude: dto.longitude ?? job.longitude,
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

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.jobSkills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.category', 'category')
      .andWhere('skill.id IN (:...skillIds)', { skillIds })
      .orderBy('job.createdAt', 'DESC');

    this.applyPublicJobVisibilityFilters(queryBuilder);

    return queryBuilder.getMany();
  }

  async getMatchByMajor(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['major'],
    });

    if (!student) throw new NotFoundException('Student profile not found');
    if (!student.major) return [];

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .andWhere('LOWER(category.name) LIKE :major', {
        major: `%${student.major.name.toLowerCase()}%`,
      })
      .orderBy('job.createdAt', 'DESC');

    this.applyPublicJobVisibilityFilters(queryBuilder);

    return queryBuilder.getMany();
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
      return this.getAllJobs({ page: 1, limit: 10 });
    }

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.jobSkills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill');

    this.applyPublicJobVisibilityFilters(qb);

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
    employerId?: string,
  ) {
    if (dto.categoryId) {
      const category = await this.jobCategoryRepository
        .createQueryBuilder('category')
        .leftJoin('category.employer', 'employer')
        .where('category.id = :categoryId', { categoryId: dto.categoryId })
        .andWhere('category.isActive = true')
        .andWhere(
          employerId ? 'employer.id = :employerId' : 'employer.id IS NULL',
          { employerId },
        )
        .getOne();
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
    const {
      keyword,
      category,
      type,
      minSalary,
      deadlineSort,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer');

    this.applyPublicJobVisibilityFilters(qb);

    if (keyword) {
      qb.andWhere(
        '(job.title ILIKE :keyword OR job.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (category) {
      qb.andWhere('category.name ILIKE :category', {
        category: `%${category}%`,
      });
    }

    // if (location) {
    //   qb.andWhere('(job.location ILIKE :location OR employer.location ILIKE :location)', {
    //     location: `%${location}%`,
    //   });
    // }

    if (type) {
      qb.andWhere('jobType.name = :type', { type });
    }

    if (minSalary !== undefined) {
      qb.andWhere('job.salaryMin >= :minSalary', { minSalary });
    }

    if (deadlineSort) {
      qb.orderBy(
        'job.deadline',
        deadlineSort.toUpperCase() as 'ASC' | 'DESC',
        'NULLS LAST',
      ).addOrderBy('job.createdAt', 'DESC');
    } else {
      qb.orderBy('job.createdAt', 'DESC');
    }

    const [jobs, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const mappedJobs = jobs.map((job) => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));

    return {
      data: mappedJobs,
      meta: {
        totalItems: total,
        itemCount: mappedJobs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async searchJobsForAdmin(query: JobSearchDto) {
    const {
      keyword,
      category,
      location,
      type,
      minSalary,
      status,
      blocked,
      deadlineSort,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer');

    if (keyword) {
      qb.andWhere(
        '(job.title ILIKE :keyword OR job.description ILIKE :keyword OR employer.companyName ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (category) {
      qb.andWhere('category.name ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (location) {
      qb.andWhere(
        '(job.location ILIKE :location OR employer.location ILIKE :location)',
        {
          location: `%${location}%`,
        },
      );
    }

    if (type) {
      qb.andWhere('jobType.name = :type', { type });
    }

    if (status) {
      qb.andWhere('LOWER(status.name) = LOWER(:status)', { status });
    }

    if (blocked !== undefined) {
      qb.andWhere('job.is_blocked = :blocked', { blocked });
    }

    if (minSalary !== undefined) {
      qb.andWhere('job.salaryMin >= :minSalary', { minSalary });
    }

    if (deadlineSort) {
      qb.orderBy(
        'job.deadline',
        deadlineSort.toUpperCase() as 'ASC' | 'DESC',
        'NULLS LAST',
      ).addOrderBy('job.createdAt', 'DESC');
    } else {
      qb.orderBy('job.createdAt', 'DESC');
    }

    const [jobs, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const mappedJobs = jobs.map((job) => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
    }));

    return {
      data: mappedJobs,
      meta: {
        totalItems: total,
        itemCount: mappedJobs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async exportJobsCsvForAdmin(query: JobSearchDto) {
    const {
      keyword,
      category,
      location,
      type,
      minSalary,
      status,
      blocked,
      deadlineSort,
    } = query;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer');

    if (keyword) {
      qb.andWhere(
        '(job.title ILIKE :keyword OR job.description ILIKE :keyword OR employer.companyName ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (category) {
      qb.andWhere('category.name ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (location) {
      qb.andWhere(
        '(job.location ILIKE :location OR employer.location ILIKE :location)',
        {
          location: `%${location}%`,
        },
      );
    }

    if (type) {
      qb.andWhere('jobType.name = :type', { type });
    }

    if (status) {
      qb.andWhere('LOWER(status.name) = LOWER(:status)', { status });
    }

    if (blocked !== undefined) {
      qb.andWhere('job.is_blocked = :blocked', { blocked });
    }

    if (minSalary !== undefined) {
      qb.andWhere('job.salaryMin >= :minSalary', { minSalary });
    }

    if (deadlineSort) {
      qb.orderBy(
        'job.deadline',
        deadlineSort.toUpperCase() as 'ASC' | 'DESC',
        'NULLS LAST',
      ).addOrderBy('job.createdAt', 'DESC');
    } else {
      qb.orderBy('job.createdAt', 'DESC');
    }

    const jobs = await qb.getMany();

    const headers = [
      'Title',
      'Company',
      'Category',
      'Type',
      'Status',
      'Blocked',
      'Salary Min',
      'Salary Max',
      'Currency',
      'Openings',
      'Location',
      'Posted Date',
      'Deadline',
    ];

    const rows = jobs.map((job) => [
      job.title,
      job.employer?.companyName,
      job.category?.name,
      job.jobType?.name,
      job.status?.name,
      job.is_blocked ? 'Yes' : 'No',
      job.salaryMin,
      job.salaryMax,
      job.currency,
      job.numberOfOpenings,
      job.location ?? job.employer?.location,
      job.createdAt,
      job.deadline,
    ]);

    return [
      headers.join(','),
      ...rows.map((row) =>
        row.map((value) => this.escapeCsvValue(value)).join(','),
      ),
    ].join('\n');
  }
}
