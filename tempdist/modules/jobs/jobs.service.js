"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("./job.entity");
const job_approval_status_enum_1 = require("./job-approval-status.enum");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const job_category_entity_1 = require("../../entities/master/job-category.entity");
const job_type_entity_1 = require("../../entities/master/job-type.entity");
const job_status_entity_1 = require("../../entities/master/job-status.entity");
const job_history_entity_1 = require("./job-history.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const PUBLIC_JOB_STATUS_NAMES = ['published', 'active', 'open'];
let JobsService = class JobsService {
    jobRepository;
    employerProfileRepository;
    jobCategoryRepository;
    jobTypeRepository;
    jobStatusRepository;
    jobHistoryRepository;
    studentProfileRepository;
    constructor(jobRepository, employerProfileRepository, jobCategoryRepository, jobTypeRepository, jobStatusRepository, jobHistoryRepository, studentProfileRepository) {
        this.jobRepository = jobRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.jobCategoryRepository = jobCategoryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.jobStatusRepository = jobStatusRepository;
        this.jobHistoryRepository = jobHistoryRepository;
        this.studentProfileRepository = studentProfileRepository;
    }
    escapeCsvValue(value) {
        const text = String(value ?? '');
        return `"${text.replace(/"/g, '""')}"`;
    }
    async getAllJobs(paginationDto) {
        const { page, limit, deadlineSort } = paginationDto;
        const skip = (page - 1) * limit;
        const queryBuilder = this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.category', 'category')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.status', 'status')
            .leftJoinAndSelect('job.employer', 'employer')
            .where('LOWER(status.name) IN (:...visibleStatuses)', {
            visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
        })
            .andWhere('job.approvalStatus = :approvalStatus', {
            approvalStatus: job_approval_status_enum_1.JobApprovalStatus.APPROVED,
        })
            .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())')
            .andWhere('(job.is_blocked IS FALSE)')
            .skip(skip)
            .take(limit);
        if (deadlineSort) {
            queryBuilder
                .orderBy('job.deadline', deadlineSort.toUpperCase(), 'NULLS LAST')
                .addOrderBy('job.createdAt', 'DESC');
        }
        else {
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
    async getAllJobsForAdmin(paginationDto) {
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
                .orderBy('job.deadline', deadlineSort.toUpperCase(), 'NULLS LAST')
                .addOrderBy('job.createdAt', 'DESC');
        }
        else {
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
    async setJobBlocked(id, blocked) {
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: ['category', 'jobType', 'status', 'employer'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        job.is_blocked = blocked;
        job.updatedAt = new Date();
        await this.jobRepository.save(job);
        return job;
    }
    async getJobByIdForAdmin(id) {
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
            throw new common_1.NotFoundException('Job not found');
        }
        return {
            ...job,
            isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
        };
    }
    async getJobCategories() {
        return this.jobCategoryRepository.find({
            where: { isActive: true, employer: (0, typeorm_2.IsNull)() },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async getJobById(id) {
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
            .andWhere('(job.is_blocked IS FALSE)')
            .getOne();
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        return {
            ...job,
            isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
        };
    }
    async createJob(userId, dto) {
        const employer = await this.getEmployerProfileByUserId(userId);
        const activeJobCount = await this.jobRepository.count({
            where: {
                employer: { id: employer.id },
                status: { name: 'active' },
            },
        });
        if (employer.jobPostLimit &&
            employer.jobPostLimit !== -1 &&
            activeJobCount >= employer.jobPostLimit) {
            throw new common_1.ForbiddenException(`You have reached the maximum job posting limit of ${employer.jobPostLimit} for your current plan. Please upgrade your plan to post more jobs.`);
        }
        await this.assertJobRelationsExist(dto, employer.id);
        const job = this.jobRepository.create({
            ...dto,
            employer: { id: employer.id },
            category: dto.categoryId ? { id: dto.categoryId } : undefined,
            jobType: dto.jobTypeId ? { id: dto.jobTypeId } : undefined,
            status: dto.statusId ? { id: dto.statusId } : undefined,
            approvalStatus: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL,
        });
        return this.jobRepository.save(job);
    }
    async getMyPostedJobs(userId) {
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
    async getMyPostedJobById(userId, id) {
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
            throw new common_1.NotFoundException('Job not found');
        }
        return {
            ...job,
            isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
        };
    }
    async updateJob(userId, id, dto) {
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        this.ensureEmployerOwnsJob(job, userId);
        await this.assertJobRelationsExist(dto, job.employer.id);
        await this.recordJobHistory(job);
        Object.assign(job, {
            title: dto.title ?? job.title,
            description: dto.description ?? job.description,
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
                ? { id: dto.categoryId }
                : job.category,
            jobType: dto.jobTypeId
                ? { id: dto.jobTypeId }
                : job.jobType,
            status: dto.statusId
                ? { id: dto.statusId }
                : job.status,
            updatedAt: new Date(),
        });
        await this.jobRepository.save(job);
        return this.jobRepository.findOne({
            where: { id },
            relations: ['category', 'jobType', 'status', 'employer'],
        });
    }
    async updateJobStatus(userId, id, dto) {
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        this.ensureEmployerOwnsJob(job, userId);
        await this.assertJobStatusExists(dto.statusId);
        await this.recordJobHistory(job);
        job.status = { id: dto.statusId };
        job.updatedAt = new Date();
        await this.jobRepository.save(job);
        return this.jobRepository.findOne({
            where: { id },
            relations: ['category', 'jobType', 'status', 'employer'],
        });
    }
    async deleteJob(userId, id) {
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: ['employer', 'employer.user'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        this.ensureEmployerOwnsJob(job, userId);
        const applicationsCount = await this.jobRepository
            .createQueryBuilder('job')
            .leftJoin('job.applications', 'application')
            .where('job.id = :id', { id: job.id })
            .select('COUNT(application.id)', 'count')
            .getRawOne();
        if (Number(applicationsCount?.count ?? 0) > 0) {
            throw new common_1.BadRequestException('Cannot delete this job because it already has applications. Please close the job instead.');
        }
        await this.jobHistoryRepository
            .createQueryBuilder()
            .delete()
            .from(job_history_entity_1.JobHistory)
            .where('job_id = :jobId', { jobId: job.id })
            .execute();
        await this.jobRepository.remove(job);
        return { message: 'Job deleted successfully' };
    }
    async getMatchBySkills(userId) {
        const student = await this.studentProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['studentSkills', 'studentSkills.skill'],
        });
        if (!student)
            throw new common_1.NotFoundException('Student profile not found');
        const skillIds = student.studentSkills.map((s) => s.skill.id);
        if (skillIds.length === 0)
            return [];
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
    async getMatchByMajor(userId) {
        const student = await this.studentProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['major'],
        });
        if (!student)
            throw new common_1.NotFoundException('Student profile not found');
        if (!student.major)
            return [];
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
    async getRecommendedJobs(userId) {
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
        if (!student)
            throw new common_1.NotFoundException('Student profile not found');
        const categoryIds = new Set();
        student.applications?.forEach((a) => {
            if (a.job?.category?.id)
                categoryIds.add(a.job.category.id);
        });
        student.savedJobs?.forEach((s) => {
            if (s.job?.category?.id)
                categoryIds.add(s.job.category.id);
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
            .leftJoinAndSelect('jobSkill.skill', 'skill')
            .where('LOWER(status.name) IN (:...visibleStatuses)', {
            visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
        })
            .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())');
        if (categoryIds.size > 0 && skillIds.length > 0) {
            qb.andWhere('(category.id IN (:...categoryIds) OR skill.id IN (:...skillIds))', { categoryIds: [...categoryIds], skillIds });
        }
        else if (categoryIds.size > 0) {
            qb.andWhere('category.id IN (:...categoryIds)', {
                categoryIds: [...categoryIds],
            });
        }
        else {
            qb.andWhere('skill.id IN (:...skillIds)', { skillIds });
        }
        return qb.orderBy('job.createdAt', 'DESC').getMany();
    }
    async getEmployerProfileByUserId(userId) {
        const employer = await this.employerProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!employer) {
            throw new common_1.NotFoundException('Employer profile not found');
        }
        return employer;
    }
    ensureEmployerOwnsJob(job, userId) {
        if (job.employer?.user?.id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this job');
        }
    }
    async assertJobRelationsExist(dto, employerId) {
        if (dto.categoryId) {
            const category = await this.jobCategoryRepository
                .createQueryBuilder('category')
                .leftJoin('category.employer', 'employer')
                .where('category.id = :categoryId', { categoryId: dto.categoryId })
                .andWhere('category.isActive = true')
                .andWhere(employerId ? 'employer.id = :employerId' : 'employer.id IS NULL', { employerId })
                .getOne();
            if (!category) {
                throw new common_1.NotFoundException('Job category not found');
            }
        }
        if (dto.jobTypeId) {
            const jobType = await this.jobTypeRepository.findOne({
                where: { id: dto.jobTypeId },
            });
            if (!jobType) {
                throw new common_1.NotFoundException('Job type not found');
            }
        }
        if (dto.statusId) {
            await this.assertJobStatusExists(dto.statusId);
        }
    }
    async assertJobStatusExists(statusId) {
        const status = await this.jobStatusRepository.findOne({
            where: { id: statusId },
        });
        if (!status) {
            throw new common_1.NotFoundException('Job status not found');
        }
    }
    async recordJobHistory(job) {
        await this.jobHistoryRepository.save(this.jobHistoryRepository.create({
            job: { id: job.id },
            title: job.title,
            description: job.description,
            salary_min: job.salaryMin,
            salary_max: job.salaryMax,
        }));
    }
    async searchJobs(query) {
        const { keyword, category, type, minSalary, deadlineSort, page = 1, limit = 10, } = query;
        const skip = (page - 1) * limit;
        const qb = this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.category', 'category')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.status', 'status')
            .leftJoinAndSelect('job.employer', 'employer')
            .where('LOWER(status.name) IN (:...visibleStatuses)', {
            visibleStatuses: PUBLIC_JOB_STATUS_NAMES,
        })
            .andWhere('(job.deadline IS NULL OR job.deadline >= NOW())');
        if (keyword) {
            qb.andWhere('(job.title ILIKE :keyword OR job.description ILIKE :keyword)', { keyword: `%${keyword}%` });
        }
        if (category) {
            qb.andWhere('category.name ILIKE :category', {
                category: `%${category}%`,
            });
        }
        if (location) {
            qb.andWhere('(job.location ILIKE :location OR employer.location ILIKE :location)', {
                location: `%${location}%`,
            });
        }
        if (type) {
            qb.andWhere('jobType.name = :type', { type });
        }
        if (minSalary !== undefined) {
            qb.andWhere('job.salaryMin >= :minSalary', { minSalary });
        }
        if (deadlineSort) {
            qb.orderBy('job.deadline', deadlineSort.toUpperCase(), 'NULLS LAST').addOrderBy('job.createdAt', 'DESC');
        }
        else {
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
    async searchJobsForAdmin(query) {
        const { keyword, category, location, type, minSalary, status, blocked, deadlineSort, page = 1, limit = 10, } = query;
        const skip = (page - 1) * limit;
        const qb = this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.category', 'category')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.status', 'status')
            .leftJoinAndSelect('job.employer', 'employer');
        if (keyword) {
            qb.andWhere('(job.title ILIKE :keyword OR job.description ILIKE :keyword OR employer.companyName ILIKE :keyword)', { keyword: `%${keyword}%` });
        }
        if (category) {
            qb.andWhere('category.name ILIKE :category', {
                category: `%${category}%`,
            });
        }
        if (location) {
            qb.andWhere('(job.location ILIKE :location OR employer.location ILIKE :location)', {
                location: `%${location}%`,
            });
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
            qb.orderBy('job.deadline', deadlineSort.toUpperCase(), 'NULLS LAST')
                .addOrderBy('job.createdAt', 'DESC');
        }
        else {
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
    async exportJobsCsvForAdmin(query) {
        const { keyword, category, location, type, minSalary, status, blocked, deadlineSort, } = query;
        const qb = this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.category', 'category')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.status', 'status')
            .leftJoinAndSelect('job.employer', 'employer');
        if (keyword) {
            qb.andWhere('(job.title ILIKE :keyword OR job.description ILIKE :keyword OR employer.companyName ILIKE :keyword)', { keyword: `%${keyword}%` });
        }
        if (category) {
            qb.andWhere('category.name ILIKE :category', { category: `%${category}%` });
        }
        if (location) {
            qb.andWhere('(job.location ILIKE :location OR employer.location ILIKE :location)', {
                location: `%${location}%`,
            });
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
            qb.orderBy('job.deadline', deadlineSort.toUpperCase(), 'NULLS LAST')
                .addOrderBy('job.createdAt', 'DESC');
        }
        else {
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
            ...rows.map((row) => row.map((value) => this.escapeCsvValue(value)).join(',')),
        ].join('\n');
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(job_category_entity_1.JobCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(job_type_entity_1.JobType)),
    __param(4, (0, typeorm_1.InjectRepository)(job_status_entity_1.JobStatus)),
    __param(5, (0, typeorm_1.InjectRepository)(job_history_entity_1.JobHistory)),
    __param(6, (0, typeorm_1.InjectRepository)(student_profile_entity_1.StudentProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map