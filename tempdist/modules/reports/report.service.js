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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./report.entity");
const job_entity_1 = require("../jobs/job.entity");
const user_entity_1 = require("../users/user.entity");
const report_status_enum_1 = require("./report-status.enum");
const notification_service_1 = require("../notifications/notification.service");
const notification_type_enum_1 = require("../notifications/notification-type.enum");
const notification_channel_enum_1 = require("../notifications/notification-channel.enum");
const audit_service_1 = require("../audit-logs/audit.service");
const audit_log_entity_1 = require("../audit-logs/audit-log.entity");
let ReportService = class ReportService {
    reportRepository;
    jobRepository;
    userRepository;
    notificationService;
    auditService;
    constructor(reportRepository, jobRepository, userRepository, notificationService, auditService) {
        this.reportRepository = reportRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }
    async createReport(userId, type, description, jobId, metadata) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        if (jobId) {
            const job = await this.jobRepository.findOne({ where: { id: jobId } });
            if (!job) {
                throw new common_1.NotFoundException(`Job ${jobId} not found`);
            }
        }
        const report = this.reportRepository.create({
            userId,
            jobId: jobId || null,
            type,
            description,
            reason: description,
            status: report_status_enum_1.ReportStatus.OPEN,
            metadata,
        });
        const saved = await this.reportRepository.save(report);
        console.log(`New report created: ${saved.id}`);
        return saved;
    }
    async getReports(page = 1, limit = 20, status, type, jobId) {
        let query = this.reportRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.user', 'user')
            .leftJoinAndSelect('r.job', 'job')
            .leftJoinAndSelect('job.employer', 'employer');
        if (status) {
            query = query.andWhere('r.status = :status', { status });
        }
        if (type) {
            query = query.andWhere('r.type = :type', { type });
        }
        if (jobId) {
            query = query.andWhere('r.jobId = :jobId', { jobId });
        }
        query = query.orderBy('r.createdAt', 'DESC');
        const currentPage = Math.max(page, 1);
        const itemsPerPage = Math.max(limit, 1);
        const skip = (currentPage - 1) * itemsPerPage;
        const [data, total] = await query
            .skip(skip)
            .take(itemsPerPage)
            .getManyAndCount();
        return {
            data,
            total,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage,
                totalPages: Math.max(Math.ceil(total / itemsPerPage), 1),
                currentPage,
            },
        };
    }
    async getUserReports(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.reportRepository.findAndCount({
            where: { userId },
            relations: ['job', 'user'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getJobReports(jobId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.reportRepository.findAndCount({
            where: { jobId },
            relations: ['user', 'job'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getReportById(reportId) {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: ['user', 'job', 'job.employer'],
        });
        if (!report) {
            throw new common_1.NotFoundException(`Report ${reportId} not found`);
        }
        return report;
    }
    async updateReportStatus(reportId, status, adminId, adminNotes) {
        const report = await this.getReportById(reportId);
        const oldData = {
            status: report.status,
            adminNotes: report.adminNotes,
        };
        report.status = status;
        if (adminNotes) {
            report.adminNotes = adminNotes;
        }
        if (status === report_status_enum_1.ReportStatus.RESOLVED ||
            status === report_status_enum_1.ReportStatus.DISMISSED ||
            status === report_status_enum_1.ReportStatus.ACTION_TAKEN) {
            report.resolvedAt = new Date();
            report.resolvedByAdminId = adminId;
        }
        const updated = await this.reportRepository.save(report);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.UPDATE,
            module: 'reports',
            entityId: reportId,
            entityType: 'Report',
            oldData,
            newData: {
                status: updated.status,
                adminNotes: updated.adminNotes,
                resolvedAt: updated.resolvedAt,
            },
            description: `Report status updated to ${status}`,
        });
        await this.notificationService.createNotification(report.userId, notification_type_enum_1.NotificationType.REPORT_STATUS_CHANGED, 'Report Status Updated', `Your report has been reviewed. Status: ${status}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''}`, notification_channel_enum_1.NotificationChannel.IN_APP, {
            referenceId: reportId,
            metadata: {
                reportId,
                newStatus: status,
            },
        });
        return updated;
    }
    async resolveReport(reportId, action, adminId, adminNotes) {
        const report = await this.getReportById(reportId);
        if (action === 'REMOVE_JOB' && report.jobId) {
            console.log(`Job ${report.jobId} should be removed`);
        }
        if (action === 'SUSPEND_EMPLOYER' && report.job?.employer?.id) {
            console.log(`Employer ${report.job.employer.id} should be suspended`);
        }
        const updated = await this.updateReportStatus(reportId, action === 'DISMISS' ? report_status_enum_1.ReportStatus.DISMISSED : report_status_enum_1.ReportStatus.ACTION_TAKEN, adminId, adminNotes);
        return updated;
    }
    async deleteReport(reportId, adminId) {
        const report = await this.getReportById(reportId);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.DELETE,
            module: 'reports',
            entityId: reportId,
            entityType: 'Report',
            oldData: {
                type: report.type,
                description: report.description,
                status: report.status,
            },
            newData: undefined,
            description: `Report deleted`,
        });
        await this.reportRepository.remove(report);
    }
    async getStats() {
        const total = await this.reportRepository.count();
        const open = await this.reportRepository.count({ where: { status: report_status_enum_1.ReportStatus.OPEN } });
        const underReview = await this.reportRepository.count({
            where: { status: report_status_enum_1.ReportStatus.UNDER_REVIEW },
        });
        const resolved = await this.reportRepository.count({
            where: { status: report_status_enum_1.ReportStatus.RESOLVED },
        });
        const dismissed = await this.reportRepository.count({
            where: { status: report_status_enum_1.ReportStatus.DISMISSED },
        });
        const actionTaken = await this.reportRepository.count({
            where: { status: report_status_enum_1.ReportStatus.ACTION_TAKEN },
        });
        const byType = await this.reportRepository
            .createQueryBuilder('r')
            .select('r.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('r.type')
            .getRawMany();
        const mostReportedJobs = await this.reportRepository
            .createQueryBuilder('r')
            .select('r.jobId', 'jobId')
            .addSelect('COUNT(*)', 'count')
            .where('r.jobId IS NOT NULL')
            .groupBy('r.jobId')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        return {
            total,
            byStatus: {
                open,
                underReview,
                resolved,
                dismissed,
                actionTaken,
            },
            byType,
            mostReportedJobs,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        audit_service_1.AuditService])
], ReportService);
//# sourceMappingURL=report.service.js.map