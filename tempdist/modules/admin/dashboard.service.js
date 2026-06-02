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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const user_status_enum_1 = require("../users/user-status.enum");
const job_entity_1 = require("../jobs/job.entity");
const job_approval_status_enum_1 = require("../jobs/job-approval-status.enum");
const application_entity_1 = require("../applications/application.entity");
const payment_entity_1 = require("../payments/payment.entity");
const payment_status_enum_1 = require("../payments/enum/payment-status.enum");
const report_entity_1 = require("../reports/report.entity");
const report_status_enum_1 = require("../reports/report-status.enum");
const audit_log_entity_1 = require("../audit-logs/audit-log.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const notification_status_enum_1 = require("../notifications/notification-status.enum");
let DashboardService = class DashboardService {
    userRepository;
    jobRepository;
    applicationRepository;
    paymentRepository;
    reportRepository;
    auditLogRepository;
    notificationRepository;
    constructor(userRepository, jobRepository, applicationRepository, paymentRepository, reportRepository, auditLogRepository, notificationRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.paymentRepository = paymentRepository;
        this.reportRepository = reportRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }
    async getOverview() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const [totalStudents, totalEmployers, totalJobs, totalApplications, activeJobs, pendingReports, openReports, totalRevenue,] = await Promise.all([
            this.userRepository.count({ where: { role: { name: 'STUDENT' } } }),
            this.userRepository.count({ where: { role: { name: 'EMPLOYER' } } }),
            this.jobRepository.count(),
            this.applicationRepository.count(),
            this.jobRepository.count({ where: { status: { name: 'active' } } }),
            this.reportRepository.count({ where: { status: report_status_enum_1.ReportStatus.OPEN } }),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.UNDER_REVIEW },
            }),
            this.getRevenue(),
        ]);
        return {
            totalStudents,
            totalEmployers,
            totalUsers: totalStudents + totalEmployers,
            totalJobs,
            activeJobs,
            totalApplications,
            pendingReports,
            openReports,
            totalRevenue,
        };
    }
    async getUserStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalStudents, totalEmployers, activeStudents, verifiedEmployers, unverifiedEmployers, suspendedUsers, newUsersThisPeriod,] = await Promise.all([
            this.userRepository.count({ where: { role: { name: 'STUDENT' } } }),
            this.userRepository.count({ where: { role: { name: 'EMPLOYER' } } }),
            this.userRepository.count({
                where: {
                    role: { name: 'STUDENT' },
                    status: user_status_enum_1.UserStatus.ACTIVE,
                },
            }),
            this.userRepository.count({
                where: {
                    role: { name: 'EMPLOYER' },
                    isVerified: true,
                },
            }),
            this.userRepository.count({
                where: {
                    role: { name: 'EMPLOYER' },
                    isVerified: false,
                },
            }),
            this.userRepository.count({
                where: { status: user_status_enum_1.UserStatus.SUSPENDED },
            }),
            this.userRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(startDate, new Date()) },
            }),
        ]);
        return {
            totalStudents,
            totalEmployers,
            activeStudents,
            verifiedEmployers,
            unverifiedEmployers,
            suspendedUsers,
            newUsersThisPeriod,
            statusBreakdown: {
                active: await this.userRepository.count({
                    where: { status: user_status_enum_1.UserStatus.ACTIVE },
                }),
                suspended: suspendedUsers,
                blocked: await this.userRepository.count({
                    where: { status: user_status_enum_1.UserStatus.BLOCKED },
                }),
                unverified: await this.userRepository.count({
                    where: { status: user_status_enum_1.UserStatus.UNVERIFIED },
                }),
                pendingApproval: await this.userRepository.count({
                    where: { status: user_status_enum_1.UserStatus.PENDING_APPROVAL },
                }),
            },
        };
    }
    async getJobStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalJobs, approvedJobs, pendingJobs, rejectedJobs, newJobsThisPeriod, jobsWithApplications,] = await Promise.all([
            this.jobRepository.count(),
            this.jobRepository.count({
                where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.APPROVED },
            }),
            this.jobRepository.count({
                where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL },
            }),
            this.jobRepository.count({
                where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.REJECTED },
            }),
            this.jobRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(startDate, new Date()) },
            }),
            this.jobRepository
                .createQueryBuilder('job')
                .select('COUNT(DISTINCT job.id)', 'count')
                .leftJoin('job.applications', 'app')
                .where('app.id IS NOT NULL')
                .getRawOne(),
        ]);
        const statusBreakdown = await this.jobRepository
            .createQueryBuilder('job')
            .select('job.status.name', 'status')
            .addSelect('COUNT(*)', 'count')
            .leftJoin('job.status', 'status')
            .groupBy('job.status.name')
            .getRawMany();
        return {
            totalJobs,
            approvedJobs,
            pendingJobs,
            rejectedJobs,
            newJobsThisPeriod,
            jobsWithApplications: parseInt(jobsWithApplications?.count || '0', 10),
            statusBreakdown,
            approvalRatePercentage: totalJobs > 0
                ? Math.round((approvedJobs / (approvedJobs + rejectedJobs)) * 100) ||
                    0
                : 0,
        };
    }
    async getApplicationStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalApplications, newApplicationsThisPeriod, acceptedApplications, rejectedApplications, pendingApplications,] = await Promise.all([
            this.applicationRepository.count(),
            this.applicationRepository
                .createQueryBuilder('app')
                .where('app.appliedAt >= :startDate', { startDate })
                .getCount(),
            this.applicationRepository
                .createQueryBuilder('app')
                .leftJoin('app.currentStatus', 'status')
                .where('status.name = :status', { status: 'accepted' })
                .getCount(),
            this.applicationRepository
                .createQueryBuilder('app')
                .leftJoin('app.currentStatus', 'status')
                .where('status.name = :status', { status: 'rejected' })
                .getCount(),
            this.applicationRepository
                .createQueryBuilder('app')
                .leftJoin('app.currentStatus', 'status')
                .where('status.name = :status', { status: 'pending' })
                .getCount(),
        ]);
        const statusBreakdown = await this.applicationRepository
            .createQueryBuilder('app')
            .select('status.name', 'status')
            .addSelect('COUNT(*)', 'count')
            .leftJoin('app.currentStatus', 'status')
            .groupBy('status.name')
            .getRawMany();
        const conversionRate = totalApplications > 0
            ? (acceptedApplications / totalApplications) * 100
            : 0;
        return {
            totalApplications,
            newApplicationsThisPeriod,
            acceptedApplications,
            rejectedApplications,
            pendingApplications,
            statusBreakdown,
            conversionRatePercentage: Math.round(conversionRate),
        };
    }
    async getPaymentStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [total, successful, failed, pending] = await Promise.all([
            this.paymentRepository.count(),
            this.paymentRepository.count({ where: { status: payment_status_enum_1.PaymentStatus.PAID } }),
            this.paymentRepository.count({ where: { status: payment_status_enum_1.PaymentStatus.FAILED } }),
            this.paymentRepository.count({
                where: { status: payment_status_enum_1.PaymentStatus.PENDING },
            }),
        ]);
        const revenueResult = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .andWhere('payment.createdAt >= :startDate', { startDate })
            .getRawOne();
        const revenueAllTime = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .getRawOne();
        const planBreakdown = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('payment.planType', 'plan')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(payment.amount)', 'revenue')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .groupBy('payment.planType')
            .getRawMany();
        return {
            totalTransactions: total,
            successfulTransactions: successful,
            failedTransactions: failed,
            pendingTransactions: pending,
            successRatePercentage: total > 0 ? Math.round((successful / total) * 100) : 0,
            revenueThisPeriod: parseFloat(revenueResult?.total || '0'),
            totalRevenueAllTime: parseFloat(revenueAllTime?.total || '0'),
            planBreakdown,
        };
    }
    async getReportStats() {
        const [totalReports, openReports, underReview, resolved, dismissed, actionTaken,] = await Promise.all([
            this.reportRepository.count(),
            this.reportRepository.count({ where: { status: report_status_enum_1.ReportStatus.OPEN } }),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.UNDER_REVIEW },
            }),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.RESOLVED },
            }),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.DISMISSED },
            }),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.ACTION_TAKEN },
            }),
        ]);
        const typeBreakdown = await this.reportRepository
            .createQueryBuilder('r')
            .select('r.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('r.type')
            .getRawMany();
        const resolutionRate = (resolved + actionTaken) / (totalReports || 1);
        return {
            totalReports,
            openReports,
            underReview,
            resolved,
            dismissed,
            actionTaken,
            resolutionRatePercentage: Math.round(resolutionRate * 100),
            typeBreakdown,
        };
    }
    async getRecentAuditLogs(limit = 20) {
        const logs = await this.auditLogRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return logs.map((log) => ({
            id: log.id,
            action: log.action,
            module: log.module,
            entityType: log.entityType,
            entityId: log.entityId,
            userId: log.userId,
            userName: log.user ? `${log.user.email}` : 'Unknown',
            description: log.description,
            timestamp: log.createdAt,
        }));
    }
    async getActivityTrend(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const userCreations = await this.userRepository
            .createQueryBuilder('u')
            .select('DATE(u.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('u.createdAt >= :startDate', { startDate })
            .groupBy('DATE(u.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const jobCreations = await this.jobRepository
            .createQueryBuilder('j')
            .select('DATE(j.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('j.createdAt >= :startDate', { startDate })
            .groupBy('DATE(j.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const applicationCreations = await this.applicationRepository
            .createQueryBuilder('a')
            .select('DATE(a.appliedAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('a.appliedAt >= :startDate', { startDate })
            .groupBy('DATE(a.appliedAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        return {
            userCreations,
            jobCreations,
            applicationCreations,
        };
    }
    async getTopReportedJobs(limit = 10) {
        return this.reportRepository
            .createQueryBuilder('r')
            .select('r.jobId', 'jobId')
            .addSelect('COUNT(*)', 'reportCount')
            .addSelect('job.title', 'jobTitle')
            .leftJoin('r.job', 'job')
            .where('r.jobId IS NOT NULL')
            .groupBy('r.jobId')
            .addGroupBy('job.title')
            .orderBy('reportCount', 'DESC')
            .limit(limit)
            .getRawMany();
    }
    async getSystemHealth() {
        const [totalUsers, activeJobsToday, pendingApprovals, failedTransactions, unreadNotifications,] = await Promise.all([
            this.userRepository.count(),
            this.jobRepository.count({
                where: { status: { name: 'active' } },
            }),
            this.jobRepository.count({
                where: { approvalStatus: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL },
            }),
            this.paymentRepository.count({ where: { status: payment_status_enum_1.PaymentStatus.FAILED } }),
            this.notificationRepository.count({
                where: { status: notification_status_enum_1.NotificationStatus.PENDING },
            }),
        ]);
        return {
            totalUsers,
            activeJobsToday,
            pendingApprovals,
            failedTransactions,
            unreadNotifications,
            systemStatus: failedTransactions === 0 && pendingApprovals < 100
                ? 'HEALTHY'
                : 'WARNING',
        };
    }
    async getRevenue() {
        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .getRawOne();
        return parseFloat(result?.total || '0');
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(5, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(6, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map