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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("./application.entity");
const job_entity_1 = require("../jobs/job.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const application_status_entity_1 = require("../../entities/master/application-status.entity");
const application_status_history_entity_1 = require("./application-status-history.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const notification_service_1 = require("../notifications/notification.service");
const notification_type_enum_1 = require("../notifications/notification-type.enum");
const notification_channel_enum_1 = require("../notifications/notification-channel.enum");
const INITIAL_APPLICATION_STATUS_NAMES = ['pending', 'applied'];
let ApplicationsService = class ApplicationsService {
    applicationRepository;
    jobRepository;
    studentProfileRepository;
    applicationStatusRepository;
    applicationStatusHistoryRepository;
    resumeRepository;
    notificationService;
    constructor(applicationRepository, jobRepository, studentProfileRepository, applicationStatusRepository, applicationStatusHistoryRepository, resumeRepository, notificationService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.applicationStatusRepository = applicationStatusRepository;
        this.applicationStatusHistoryRepository = applicationStatusHistoryRepository;
        this.resumeRepository = resumeRepository;
        this.notificationService = notificationService;
    }
    async applyToJob(userId, dto) {
        const student = await this.getStudentProfileByUserId(userId);
        const existing = await this.applicationRepository
            .createQueryBuilder('application')
            .innerJoin('application.student', 'student')
            .where('student.id = :studentId', { studentId: student.id })
            .andWhere('application.job = :jobId', { jobId: dto.jobId })
            .getOne();
        if (existing) {
            throw new common_1.ConflictException('You have already applied to this job');
        }
        const job = await this.jobRepository.findOne({
            where: { id: dto.jobId },
            relations: ['status', 'employer', 'employer.user'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        this.ensureJobIsOpenForApplications(job);
        const resume = dto.resumeId
            ? await this.getResumeOwnedByUser(dto.resumeId, userId)
            : await this.getDefaultResumeForUser(userId);
        const initialStatus = await this.applicationStatusRepository
            .createQueryBuilder('status')
            .where('LOWER(status.name) IN (:...names)', {
            names: INITIAL_APPLICATION_STATUS_NAMES,
        })
            .orderBy(`CASE
          WHEN LOWER(status.name) = 'applied' THEN 1
          ELSE 2
        END`)
            .getOne();
        if (!initialStatus) {
            throw new common_1.NotFoundException('Application status not found');
        }
        const application = this.applicationRepository.create({
            job: { id: job.id },
            student: { id: student.id },
            resume: resume ? { id: resume.id } : undefined,
            currentStatus: { id: initialStatus.id },
        });
        const savedApplication = await this.applicationRepository.save(application);
        await this.applicationStatusHistoryRepository.save(this.applicationStatusHistoryRepository.create({
            application: { id: savedApplication.id },
            status: { id: initialStatus.id },
            changedBy: { id: userId },
        }));
        if (job.employer?.user?.id) {
            const studentName = `${student.firstName} ${student.lastName}`.trim();
            await this.notificationService.createNotification(job.employer.user.id, notification_type_enum_1.NotificationType.APPLICATION_RECEIVED, 'New Application', `${studentName || 'A student'} applied to ${job.title}`, notification_channel_enum_1.NotificationChannel.BOTH, {
                referenceId: savedApplication.id,
                metadata: {
                    applicationId: savedApplication.id,
                    jobId: job.id,
                    jobTitle: job.title,
                    studentName,
                },
            });
        }
        return this.getApplicationById(savedApplication.id, userId);
    }
    async getMyApplications(userId, status) {
        const student = await this.getStudentProfileByUserId(userId);
        const query = this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .innerJoinAndSelect('job.employer', 'employer')
            .innerJoinAndSelect('application.currentStatus', 'status')
            .innerJoin('application.student', 'studentProfile')
            .where('studentProfile.id = :studentId', { studentId: student.id });
        if (status) {
            query.andWhere('status.name = :status', { status });
        }
        return query.orderBy('application.appliedAt', 'DESC').getMany();
    }
    async getApplicationById(id, userId) {
        const student = await this.getStudentProfileByUserId(userId);
        const application = await this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .innerJoinAndSelect('application.currentStatus', 'status')
            .innerJoinAndSelect('application.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('student.university', 'university')
            .leftJoinAndSelect('student.major', 'major')
            .leftJoinAndSelect('application.resume', 'resume')
            .leftJoinAndSelect('application.statusHistory', 'statusHistory')
            .innerJoin('application.student', 'studentProfile')
            .where('studentProfile.id = :studentId', { studentId: student.id })
            .andWhere('application.id = :id', { id })
            .orderBy('statusHistory.changedAt', 'DESC')
            .getOne();
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async getAllApplications(filters) {
        const query = this.applicationRepository
            .createQueryBuilder('applicant')
            .leftJoinAndSelect('applicant.currentStatus', 'status');
        if (filters?.hired) {
            query.andWhere('(LOWER(status.name) = :accepted OR LOWER(status.name) = :hired)', {
                accepted: 'accepted',
                hired: 'hired',
            });
        }
        if (filters?.today) {
            query.andWhere('DATE(applicant.appliedAt) = CURRENT_DATE');
        }
        return query.getMany();
    }
    async getEmployerDashboard(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const activeJobStatuses = ['published', 'active', 'open'];
        const hiredStatuses = ['accepted', 'hired'];
        const hireGoal = 10;
        const scopedApplications = () => this.applicationRepository
            .createQueryBuilder('application')
            .innerJoin('application.job', 'job')
            .innerJoin('job.employer', 'employer')
            .innerJoin('employer.user', 'employerUser')
            .where('employerUser.id = :userId', { userId });
        const [activeJobs, activeJobsDelta, totalApplicants, newApplicantsToday, hiredThisMonthResult, pipelineRows, recentApplications,] = await Promise.all([
            this.jobRepository
                .createQueryBuilder('job')
                .innerJoin('job.employer', 'employer')
                .innerJoin('employer.user', 'employerUser')
                .innerJoin('job.status', 'status')
                .where('employerUser.id = :userId', { userId })
                .andWhere('LOWER(status.name) IN (:...activeJobStatuses)', {
                activeJobStatuses,
            })
                .andWhere('(job.deadline IS NULL OR job.deadline >= CURRENT_DATE)')
                .getCount(),
            this.jobRepository
                .createQueryBuilder('job')
                .innerJoin('job.employer', 'employer')
                .innerJoin('employer.user', 'employerUser')
                .innerJoin('job.status', 'status')
                .where('employerUser.id = :userId', { userId })
                .andWhere('LOWER(status.name) IN (:...activeJobStatuses)', {
                activeJobStatuses,
            })
                .andWhere('(job.deadline IS NULL OR job.deadline >= CURRENT_DATE)')
                .andWhere('job.createdAt >= :startOfWeek', { startOfWeek })
                .getCount(),
            scopedApplications().getCount(),
            scopedApplications()
                .andWhere('application.appliedAt >= :today', { today })
                .getCount(),
            this.applicationStatusHistoryRepository
                .createQueryBuilder('history')
                .select('COUNT(DISTINCT application.id)', 'count')
                .innerJoin('history.application', 'application')
                .innerJoin('history.status', 'status')
                .innerJoin('application.job', 'job')
                .innerJoin('job.employer', 'employer')
                .innerJoin('employer.user', 'employerUser')
                .where('employerUser.id = :userId', { userId })
                .andWhere('LOWER(status.name) IN (:...hiredStatuses)', {
                hiredStatuses,
            })
                .andWhere('history.changedAt >= :startOfMonth', { startOfMonth })
                .getRawOne(),
            scopedApplications()
                .innerJoin('application.currentStatus', 'status')
                .select('LOWER(status.name)', 'status')
                .addSelect('COUNT(application.id)', 'count')
                .groupBy('LOWER(status.name)')
                .getRawMany(),
            this.applicationRepository
                .createQueryBuilder('application')
                .innerJoinAndSelect('application.job', 'job')
                .innerJoin('job.employer', 'employer')
                .innerJoin('employer.user', 'employerUser')
                .innerJoinAndSelect('application.currentStatus', 'status')
                .innerJoinAndSelect('application.student', 'student')
                .leftJoinAndSelect('student.user', 'studentUser')
                .leftJoinAndSelect('student.university', 'university')
                .leftJoinAndSelect('student.major', 'major')
                .leftJoinAndSelect('application.resume', 'resume')
                .where('employerUser.id = :userId', { userId })
                .orderBy('application.appliedAt', 'DESC')
                .take(10)
                .getMany(),
        ]);
        const hiredThisMonth = Number(hiredThisMonthResult?.count ?? 0);
        return {
            stats: {
                activeJobs,
                activeJobsDelta,
                totalApplicants,
                newApplicantsToday,
                hiredThisMonth,
                hiredGoalPercent: Math.min(Math.round((hiredThisMonth / hireGoal) * 100), 100),
            },
            pipeline: this.toPipelineCounts(pipelineRows),
            recentApplications,
        };
    }
    async getStudentApplicationHistory(applicationId, userId) {
        const student = await this.getStudentProfileByUserId(userId);
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId, student: { id: student.id } },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return this.applicationStatusHistoryRepository
            .createQueryBuilder('history')
            .innerJoinAndSelect('history.status', 'status')
            .leftJoinAndSelect('history.changedBy', 'changedBy')
            .where('history.application = :applicationId', { applicationId })
            .orderBy('history.changedAt', 'DESC')
            .getMany();
    }
    async getCandidatePipeline(userId, filters) {
        const query = this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .innerJoinAndSelect('application.currentStatus', 'status')
            .innerJoinAndSelect('application.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('student.university', 'university')
            .leftJoinAndSelect('student.major', 'major')
            .leftJoinAndSelect('application.resume', 'resume')
            .innerJoin('job.employer', 'employer')
            .innerJoin('employer.user', 'employerUser')
            .where('employerUser.id = :userId', { userId });
        if (filters?.jobId) {
            query.andWhere('job.id = :jobId', { jobId: filters.jobId });
        }
        const applications = await query
            .orderBy('status.name', 'ASC')
            .addOrderBy('application.appliedAt', 'DESC')
            .getMany();
        const pipeline = {
            pending: [],
            reviewed: [],
            interviewing: [],
            offered: [],
            rejected: [],
        };
        for (const app of applications) {
            const statusName = app.currentStatus.name.toLowerCase();
            if (statusName === 'pending' || statusName === 'applied') {
                pipeline.pending.push(app);
            }
            else if (statusName === 'reviewed') {
                pipeline.reviewed.push(app);
            }
            else if (this.isInterviewStatusName(statusName)) {
                pipeline.interviewing.push(app);
            }
            else if (statusName === 'offered') {
                pipeline.offered.push(app);
            }
            else if (statusName === 'rejected') {
                pipeline.rejected.push(app);
            }
        }
        return pipeline;
    }
    async getEmployerInbox(userId, filters) {
        const query = this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .innerJoinAndSelect('application.currentStatus', 'status')
            .innerJoinAndSelect('application.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('student.university', 'university')
            .leftJoinAndSelect('student.major', 'major')
            .leftJoinAndSelect('application.resume', 'resume')
            .innerJoin('job.employer', 'employer')
            .innerJoin('employer.user', 'employerUser')
            .where('employerUser.id = :userId', { userId });
        if (filters.jobId) {
            query.andWhere('job.id = :jobId', { jobId: filters.jobId });
        }
        if (filters.status) {
            query.andWhere('LOWER(status.name) = LOWER(:status)', {
                status: filters.status,
            });
        }
        return query.orderBy('application.appliedAt', 'DESC').getMany();
    }
    async getApplicantsForJob(userId, jobId, status) {
        await this.ensureEmployerOwnsJob(jobId, userId);
        return this.getEmployerInbox(userId, { jobId, status });
    }
    async getEmployerApplicationHistory(userId, filters) {
        const query = this.applicationStatusHistoryRepository
            .createQueryBuilder('history')
            .innerJoinAndSelect('history.application', 'application')
            .innerJoinAndSelect('history.status', 'status')
            .leftJoinAndSelect('history.changedBy', 'changedBy')
            .innerJoin('application.job', 'job')
            .innerJoin('job.employer', 'employer')
            .innerJoin('employer.user', 'employerUser')
            .where('employerUser.id = :userId', { userId });
        if (filters.jobId) {
            query.andWhere('job.id = :jobId', { jobId: filters.jobId });
        }
        if (filters.applicationId) {
            query.andWhere('application.id = :applicationId', {
                applicationId: filters.applicationId,
            });
        }
        if (filters.startDate) {
            query.andWhere('history.changedAt >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters.endDate) {
            query.andWhere('history.changedAt <= :endDate', {
                endDate: filters.endDate,
            });
        }
        return query.orderBy('history.changedAt', 'DESC').getMany();
    }
    async getEmployerApplicationById(id, userId) {
        const application = await this.applicationRepository
            .createQueryBuilder('application')
            .innerJoinAndSelect('application.job', 'job')
            .innerJoinAndSelect('application.currentStatus', 'status')
            .innerJoinAndSelect('application.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('student.university', 'university')
            .leftJoinAndSelect('student.major', 'major')
            .leftJoinAndSelect('application.resume', 'resume')
            .leftJoinAndSelect('application.statusHistory', 'statusHistory')
            .innerJoin('job.employer', 'employer')
            .innerJoin('employer.user', 'employerUser')
            .where('application.id = :id', { id })
            .andWhere('employerUser.id = :userId', { userId })
            .orderBy('statusHistory.changedAt', 'DESC')
            .getOne();
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async updateApplicationStatus(id, userId, dto) {
        const application = await this.applicationRepository.findOne({
            where: { id },
            relations: [
                'job',
                'job.employer',
                'job.employer.user',
                'currentStatus',
                'student',
                'student.user',
            ],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.job.employer.user.id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this application');
        }
        const nextStatus = await this.applicationStatusRepository.findOne({
            where: { id: dto.statusId },
        });
        if (!nextStatus) {
            throw new common_1.NotFoundException('Application status not found');
        }
        const isMovingToAccepted = this.isAcceptedStatusName(nextStatus.name);
        const isAlreadyAccepted = this.isAcceptedStatusName(application.currentStatus?.name);
        if (isMovingToAccepted && !isAlreadyAccepted) {
            const job = await this.jobRepository.findOne({
                where: { id: application.job.id },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            if (job.numberOfOpenings !== null && job.numberOfOpenings !== undefined) {
                if (job.numberOfOpenings <= 0) {
                    throw new common_1.ConflictException('No openings remaining for this job');
                }
                job.numberOfOpenings -= 1;
                await this.jobRepository.save(job);
            }
        }
        if (!isMovingToAccepted && isAlreadyAccepted) {
            const job = await this.jobRepository.findOne({
                where: { id: application.job.id },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            if (job.numberOfOpenings !== null && job.numberOfOpenings !== undefined) {
                job.numberOfOpenings += 1;
                await this.jobRepository.save(job);
            }
        }
        application.currentStatus = {
            id: dto.statusId,
        };
        await this.applicationRepository.save(application);
        await this.applicationStatusHistoryRepository.save(this.applicationStatusHistoryRepository.create({
            application: { id: application.id },
            status: { id: nextStatus.id },
            changedBy: { id: userId },
        }));
        if (dto.sendNotification) {
            try {
                await this.notifyStudentAboutStatusChange(application, nextStatus, dto);
            }
            catch (error) {
                console.error('Failed to create application status notification:', error);
            }
        }
        return this.getEmployerApplicationById(id, userId);
    }
    async notifyStudentAboutStatusChange(application, nextStatus, dto) {
        const studentUserId = application.student?.user?.id;
        if (!studentUserId) {
            return;
        }
        const statusName = nextStatus.name;
        const normalizedStatus = statusName.toLowerCase();
        const studentName = `${application.student?.firstName ?? ''} ${application.student?.lastName ?? ''}`.trim();
        const jobTitle = application.job?.title ?? 'your application';
        const interviewText = this.formatInterviewDetails(dto.interviewDetails);
        const title = this.isInterviewStatusName(normalizedStatus)
            ? 'Interview Scheduled'
            : 'Application Status Updated';
        const message = this.isInterviewStatusName(normalizedStatus)
            ? `Your interview for ${jobTitle} has been scheduled${interviewText}.`
            : `Your application for ${jobTitle} was moved to ${statusName}.`;
        await this.notificationService.createNotification(studentUserId, this.getNotificationTypeForStatus(normalizedStatus), title, message, notification_channel_enum_1.NotificationChannel.BOTH, {
            referenceId: application.id,
            metadata: {
                applicationId: application.id,
                jobId: application.job?.id,
                jobTitle,
                studentName,
                status: statusName,
                interviewDetails: dto.interviewDetails ?? null,
            },
        });
    }
    getNotificationTypeForStatus(statusName) {
        if (this.isInterviewStatusName(statusName)) {
            return notification_type_enum_1.NotificationType.APPLICATION_INTERVIEW_SCHEDULED;
        }
        if (this.isAcceptedStatusName(statusName)) {
            return notification_type_enum_1.NotificationType.APPLICATION_ACCEPTED;
        }
        if (statusName === 'rejected') {
            return notification_type_enum_1.NotificationType.APPLICATION_REJECTED;
        }
        return notification_type_enum_1.NotificationType.APPLICATION_RECEIVED;
    }
    formatInterviewDetails(details) {
        if (!details) {
            return '';
        }
        const schedule = [details.date, details.time].filter(Boolean).join(' at ');
        if (schedule && details.meetingType) {
            return ` on ${schedule} via ${details.meetingType}`;
        }
        return schedule ? ` on ${schedule}` : '';
    }
    async getStudentProfileByUserId(userId) {
        const student = await this.studentProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        return student;
    }
    async ensureEmployerOwnsJob(jobId, userId) {
        const job = await this.jobRepository.findOne({
            where: { id: jobId },
            relations: ['employer', 'employer.user'],
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        if (job.employer.user.id !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this job');
        }
    }
    ensureJobIsOpenForApplications(job) {
        const statusName = job.status?.name?.toLowerCase().trim();
        if (!statusName ||
            ['draft', 'closed', 'filled', 'expired', 'paused'].includes(statusName)) {
            throw new common_1.ForbiddenException('This job is not open for applications');
        }
        if (job.deadline && new Date(job.deadline) < new Date()) {
            throw new common_1.ForbiddenException('This job is no longer accepting applications');
        }
        if (job.numberOfOpenings !== null &&
            job.numberOfOpenings !== undefined &&
            job.numberOfOpenings <= 0) {
            throw new common_1.ForbiddenException('This job has no openings remaining');
        }
    }
    isAcceptedStatusName(statusName) {
        const normalized = (statusName ?? '').trim().toLowerCase();
        return normalized === 'accepted' || normalized === 'hired';
    }
    isInterviewStatusName(statusName) {
        const normalized = (statusName ?? '')
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, '_');
        return (normalized === 'interviewing' ||
            normalized === 'interview_schedule' ||
            normalized === 'interview_scheduled');
    }
    toPipelineCounts(rows) {
        const pipeline = {
            pending: 0,
            reviewed: 0,
            interviewing: 0,
            offered: 0,
            rejected: 0,
        };
        for (const row of rows) {
            const status = (row.status ?? '').trim().toLowerCase();
            const count = Number(row.count ?? 0);
            if (status === 'pending' || status === 'applied') {
                pipeline.pending += count;
            }
            else if (status === 'reviewed') {
                pipeline.reviewed += count;
            }
            else if (this.isInterviewStatusName(status)) {
                pipeline.interviewing += count;
            }
            else if (status === 'offered') {
                pipeline.offered += count;
            }
            else if (status === 'rejected') {
                pipeline.rejected += count;
            }
        }
        return pipeline;
    }
    async getResumeOwnedByUser(resumeId, userId) {
        const student = await this.getStudentProfileByUserId(userId);
        const resume = await this.resumeRepository.findOne({
            where: { id: resumeId, studentId: student.id },
        });
        if (!resume) {
            throw new common_1.NotFoundException('Resume not found');
        }
        return resume;
    }
    async getDefaultResumeForUser(userId) {
        const student = await this.getStudentProfileByUserId(userId);
        return this.resumeRepository.findOne({
            where: { studentId: student.id, isDefault: true },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(student_profile_entity_1.StudentProfile)),
    __param(3, (0, typeorm_1.InjectRepository)(application_status_entity_1.ApplicationStatus)),
    __param(4, (0, typeorm_1.InjectRepository)(application_status_history_entity_1.ApplicationStatusHistory)),
    __param(5, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map