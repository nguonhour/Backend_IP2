import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { Report } from '../reports/report.entity';
import { AuditLog, AuditAction } from '../audit-logs/audit-log.entity';
import { Notification } from '../notifications/notification.entity';
export declare class DashboardService {
    private userRepository;
    private jobRepository;
    private applicationRepository;
    private paymentRepository;
    private reportRepository;
    private auditLogRepository;
    private notificationRepository;
    constructor(userRepository: Repository<User>, jobRepository: Repository<Job>, applicationRepository: Repository<Application>, paymentRepository: Repository<Payment>, reportRepository: Repository<Report>, auditLogRepository: Repository<AuditLog>, notificationRepository: Repository<Notification>);
    getOverview(): Promise<{
        totalStudents: number;
        totalEmployers: number;
        totalUsers: number;
        totalJobs: number;
        activeJobs: number;
        totalApplications: number;
        pendingReports: number;
        openReports: number;
        totalRevenue: number;
    }>;
    getUserStats(days?: number): Promise<{
        totalStudents: number;
        totalEmployers: number;
        activeStudents: number;
        verifiedEmployers: number;
        unverifiedEmployers: number;
        suspendedUsers: number;
        newUsersThisPeriod: number;
        statusBreakdown: {
            active: number;
            suspended: number;
            blocked: number;
            unverified: number;
            pendingApproval: number;
        };
    }>;
    getJobStats(days?: number): Promise<{
        totalJobs: number;
        approvedJobs: number;
        pendingJobs: number;
        rejectedJobs: number;
        newJobsThisPeriod: number;
        jobsWithApplications: number;
        statusBreakdown: any[];
        approvalRatePercentage: number;
    }>;
    getApplicationStats(days?: number): Promise<{
        totalApplications: number;
        newApplicationsThisPeriod: number;
        acceptedApplications: number;
        rejectedApplications: number;
        pendingApplications: number;
        statusBreakdown: any[];
        conversionRatePercentage: number;
    }>;
    getPaymentStats(days?: number): Promise<{
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        successRatePercentage: number;
        revenueThisPeriod: number;
        totalRevenueAllTime: number;
        planBreakdown: any[];
    }>;
    getReportStats(): Promise<{
        totalReports: number;
        openReports: number;
        underReview: number;
        resolved: number;
        dismissed: number;
        actionTaken: number;
        resolutionRatePercentage: number;
        typeBreakdown: any[];
    }>;
    getRecentAuditLogs(limit?: number): Promise<{
        id: string;
        action: AuditAction;
        module: string;
        entityType: string;
        entityId: string;
        userId: string;
        userName: string;
        description: string;
        timestamp: Date;
    }[]>;
    getActivityTrend(days?: number): Promise<{
        userCreations: any[];
        jobCreations: any[];
        applicationCreations: any[];
    }>;
    getTopReportedJobs(limit?: number): Promise<any[]>;
    getSystemHealth(): Promise<{
        totalUsers: number;
        activeJobsToday: number;
        pendingApprovals: number;
        failedTransactions: number;
        unreadNotifications: number;
        systemStatus: string;
    }>;
    private getRevenue;
}
