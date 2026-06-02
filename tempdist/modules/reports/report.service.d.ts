import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { ReportType } from './report-type.enum';
import { ReportStatus } from './report-status.enum';
import { NotificationService } from '../notifications/notification.service';
import { AuditService } from '../audit-logs/audit.service';
export declare class ReportService {
    private reportRepository;
    private jobRepository;
    private userRepository;
    private notificationService;
    private auditService;
    constructor(reportRepository: Repository<Report>, jobRepository: Repository<Job>, userRepository: Repository<User>, notificationService: NotificationService, auditService: AuditService);
    createReport(userId: string, type: ReportType, description: string, jobId?: string, metadata?: Record<string, any>): Promise<Report>;
    getReports(page?: number, limit?: number, status?: ReportStatus, type?: ReportType, jobId?: string): Promise<{
        data: Report[];
        total: number;
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getUserReports(userId: string, page?: number, limit?: number): Promise<{
        data: Report[];
        total: number;
    }>;
    getJobReports(jobId: string, page?: number, limit?: number): Promise<{
        data: Report[];
        total: number;
    }>;
    getReportById(reportId: string): Promise<Report>;
    updateReportStatus(reportId: string, status: ReportStatus, adminId: string, adminNotes?: string): Promise<Report>;
    resolveReport(reportId: string, action: 'REMOVE_JOB' | 'SUSPEND_EMPLOYER' | 'DISMISS' | 'OTHER', adminId: string, adminNotes: string): Promise<Report>;
    deleteReport(reportId: string, adminId: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        byStatus: {
            open: number;
            underReview: number;
            resolved: number;
            dismissed: number;
            actionTaken: number;
        };
        byType: any[];
        mostReportedJobs: any[];
    }>;
}
