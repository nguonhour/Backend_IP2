import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getJobTrend(days?: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getApplicationTrend(days?: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getRevenueTrend(days?: string): Promise<{
        date: any;
        revenue: number;
    }[]>;
    getUserTrend(days?: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getComparison(period1Days?: string, period2Days?: string): Promise<{
        jobs: {
            period1: number;
            period2: number;
            changePercent: number;
        };
        applications: {
            period1: number;
            period2: number;
            changePercent: number;
        };
        revenue: {
            period1: number;
            period2: number;
            changePercent: number;
        };
        users: {
            period1: number;
            period2: number;
            changePercent: number;
        };
    }>;
    getConversionFunnel(): Promise<{
        jobsCreated: number;
        jobsWithApplications: number;
        applicationSubmitted: number;
        applicationsAccepted: number;
        jobsWithApplicationsRate: number;
        applicationAcceptanceRate: number;
    }>;
}
