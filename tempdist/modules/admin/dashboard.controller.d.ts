import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getUserStats(days?: string): Promise<{
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
    getJobStats(days?: string): Promise<{
        totalJobs: number;
        approvedJobs: number;
        pendingJobs: number;
        rejectedJobs: number;
        newJobsThisPeriod: number;
        jobsWithApplications: number;
        statusBreakdown: any[];
        approvalRatePercentage: number;
    }>;
    getApplicationStats(days?: string): Promise<{
        totalApplications: number;
        newApplicationsThisPeriod: number;
        acceptedApplications: number;
        rejectedApplications: number;
        pendingApplications: number;
        statusBreakdown: any[];
        conversionRatePercentage: number;
    }>;
    getPaymentStats(days?: string): Promise<{
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
    getAuditLogs(limit?: string): Promise<{
        id: string;
        action: import("../audit-logs/audit-log.entity").AuditAction;
        module: string;
        entityType: string;
        entityId: string;
        userId: string;
        userName: string;
        description: string;
        timestamp: Date;
    }[]>;
    getActivityTrend(days?: string): Promise<{
        userCreations: any[];
        jobCreations: any[];
        applicationCreations: any[];
    }>;
    getTopReportedJobs(limit?: string): Promise<any[]>;
    getSystemHealth(): Promise<{
        totalUsers: number;
        activeJobsToday: number;
        pendingApprovals: number;
        failedTransactions: number;
        unreadNotifications: number;
        systemStatus: string;
    }>;
    getComprehensive(): Promise<{
        overview: {
            totalStudents: number;
            totalEmployers: number;
            totalUsers: number;
            totalJobs: number;
            activeJobs: number;
            totalApplications: number;
            pendingReports: number;
            openReports: number;
            totalRevenue: number;
        };
        userStats: {
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
        };
        jobStats: {
            totalJobs: number;
            approvedJobs: number;
            pendingJobs: number;
            rejectedJobs: number;
            newJobsThisPeriod: number;
            jobsWithApplications: number;
            statusBreakdown: any[];
            approvalRatePercentage: number;
        };
        applicationStats: {
            totalApplications: number;
            newApplicationsThisPeriod: number;
            acceptedApplications: number;
            rejectedApplications: number;
            pendingApplications: number;
            statusBreakdown: any[];
            conversionRatePercentage: number;
        };
        paymentStats: {
            totalTransactions: number;
            successfulTransactions: number;
            failedTransactions: number;
            pendingTransactions: number;
            successRatePercentage: number;
            revenueThisPeriod: number;
            totalRevenueAllTime: number;
            planBreakdown: any[];
        };
        reportStats: {
            totalReports: number;
            openReports: number;
            underReview: number;
            resolved: number;
            dismissed: number;
            actionTaken: number;
            resolutionRatePercentage: number;
            typeBreakdown: any[];
        };
        activityTrend: {
            userCreations: any[];
            jobCreations: any[];
            applicationCreations: any[];
        };
        systemHealth: {
            totalUsers: number;
            activeJobsToday: number;
            pendingApprovals: number;
            failedTransactions: number;
            unreadNotifications: number;
            systemStatus: string;
        };
    }>;
}
