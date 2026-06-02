import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { User } from '../users/user.entity';
export declare class AnalyticsService {
    private jobRepository;
    private applicationRepository;
    private paymentRepository;
    private userRepository;
    constructor(jobRepository: Repository<Job>, applicationRepository: Repository<Application>, paymentRepository: Repository<Payment>, userRepository: Repository<User>);
    getJobTrendData(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getApplicationTrendData(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getRevenueTrendData(days?: number): Promise<{
        date: any;
        revenue: number;
    }[]>;
    getUserTrendData(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getComparisonMetrics(period1Days?: number, period2Days?: number): Promise<{
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
    private getRevenueForPeriod;
    private calculateChange;
    private formatTrendData;
}
