import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { Report } from '../reports/report.entity';
export declare class AdminService {
    private userRepository;
    private jobRepository;
    private applicationRepository;
    private paymentRepository;
    private reportRepository;
    constructor(userRepository: Repository<User>, jobRepository: Repository<Job>, applicationRepository: Repository<Application>, paymentRepository: Repository<Payment>, reportRepository: Repository<Report>);
    getDashboard(): Promise<{
        totalStudents: number;
        totalEmployers: number;
        totalJobs: number;
        newApplicantsToday: number;
        totalReports: number;
        pendingReports: number;
        totalRevenue: number;
    }>;
}
