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
exports.JobModerationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("../jobs/job.entity");
const job_approval_status_enum_1 = require("../jobs/job-approval-status.enum");
const audit_service_1 = require("../audit-logs/audit.service");
const audit_log_entity_1 = require("../audit-logs/audit-log.entity");
const notification_service_1 = require("../notifications/notification.service");
const notification_type_enum_1 = require("../notifications/notification-type.enum");
const notification_channel_enum_1 = require("../notifications/notification-channel.enum");
let JobModerationService = class JobModerationService {
    jobRepository;
    auditService;
    notificationService;
    constructor(jobRepository, auditService, notificationService) {
        this.jobRepository = jobRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async getPendingJobs(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.jobRepository.findAndCount({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL },
            relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getApprovedJobs(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.jobRepository.findAndCount({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.APPROVED },
            relations: ['employer', 'category', 'jobType', 'status'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getRejectedJobs(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.jobRepository.findAndCount({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.REJECTED },
            relations: ['employer', 'category', 'jobType', 'status'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getJobForModeration(jobId) {
        const job = await this.jobRepository.findOne({
            where: { id: jobId },
            relations: ['employer', 'employer.user', 'category', 'jobType', 'status'],
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job ${jobId} not found`);
        }
        return job;
    }
    async approveJob(jobId, adminId) {
        const job = await this.getJobForModeration(jobId);
        const oldData = {
            approvalStatus: job.approvalStatus,
            rejectionReason: job.rejectionReason,
        };
        job.approvalStatus = job_approval_status_enum_1.JobApprovalStatus.APPROVED;
        job.rejectionReason = null;
        const updated = await this.jobRepository.save(job);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.APPROVE,
            module: 'jobs',
            entityId: jobId,
            entityType: 'Job',
            oldData,
            newData: {
                approvalStatus: job.approvalStatus,
                rejectionReason: null,
            },
            description: `Job "${job.title}" approved`,
        });
        await this.notificationService.createNotification(job.employer.user.id, notification_type_enum_1.NotificationType.JOB_APPROVED, 'Job Approved', `Your job posting "${job.title}" has been approved and is now visible to students.`, notification_channel_enum_1.NotificationChannel.BOTH, {
            referenceId: jobId,
            metadata: {
                jobId,
                jobTitle: job.title,
                employerId: job.employer.id,
            },
        });
        return updated;
    }
    async rejectJob(jobId, reason, adminId) {
        const job = await this.getJobForModeration(jobId);
        const oldData = {
            approvalStatus: job.approvalStatus,
            rejectionReason: job.rejectionReason,
        };
        job.approvalStatus = job_approval_status_enum_1.JobApprovalStatus.REJECTED;
        job.rejectionReason = reason;
        const updated = await this.jobRepository.save(job);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.REJECT,
            module: 'jobs',
            entityId: jobId,
            entityType: 'Job',
            oldData,
            newData: {
                approvalStatus: job.approvalStatus,
                rejectionReason: reason,
            },
            description: `Job "${job.title}" rejected: ${reason}`,
        });
        await this.notificationService.createNotification(job.employer.user.id, notification_type_enum_1.NotificationType.JOB_REJECTED, 'Job Rejected', `Your job posting "${job.title}" was not approved. Reason: ${reason}. You can make changes and resubmit.`, notification_channel_enum_1.NotificationChannel.BOTH, {
            referenceId: jobId,
            metadata: {
                jobId,
                jobTitle: job.title,
                employerId: job.employer.id,
                rejectionReason: reason,
            },
        });
        return updated;
    }
    async resubmitJob(jobId, employerId) {
        const job = await this.getJobForModeration(jobId);
        if (job.approvalStatus !== job_approval_status_enum_1.JobApprovalStatus.REJECTED) {
            throw new Error('Only rejected jobs can be resubmitted');
        }
        if (job.employer.id !== employerId) {
            throw new Error('Job does not belong to this employer');
        }
        const oldData = {
            approvalStatus: job.approvalStatus,
            rejectionReason: job.rejectionReason,
        };
        job.approvalStatus = job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL;
        job.rejectionReason = null;
        const updated = await this.jobRepository.save(job);
        await this.auditService.log({
            userId: employerId,
            action: audit_log_entity_1.AuditAction.UPDATE,
            module: 'jobs',
            entityId: jobId,
            entityType: 'Job',
            oldData,
            newData: {
                approvalStatus: job.approvalStatus,
                rejectionReason: null,
            },
            description: `Job "${job.title}" resubmitted for approval`,
        });
        return updated;
    }
    async getModerationStats() {
        const pending = await this.jobRepository.count({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL },
        });
        const approved = await this.jobRepository.count({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.APPROVED },
        });
        const rejected = await this.jobRepository.count({
            where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.REJECTED },
        });
        return { pending, approved, rejected, total: pending + approved + rejected };
    }
};
exports.JobModerationService = JobModerationService;
exports.JobModerationService = JobModerationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService,
        notification_service_1.NotificationService])
], JobModerationService);
//# sourceMappingURL=job-moderation.service.js.map