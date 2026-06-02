import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { AuditService } from '../audit-logs/audit.service';
import { NotificationService } from '../notifications/notification.service';
export declare class JobModerationService {
    private jobRepository;
    private auditService;
    private notificationService;
    constructor(jobRepository: Repository<Job>, auditService: AuditService, notificationService: NotificationService);
    getPendingJobs(page?: number, limit?: number): Promise<{
        data: Job[];
        total: number;
    }>;
    getApprovedJobs(page?: number, limit?: number): Promise<{
        data: Job[];
        total: number;
    }>;
    getRejectedJobs(page?: number, limit?: number): Promise<{
        data: Job[];
        total: number;
    }>;
    getJobForModeration(jobId: string): Promise<Job>;
    approveJob(jobId: string, adminId: string): Promise<Job>;
    rejectJob(jobId: string, reason: string, adminId: string): Promise<Job>;
    resubmitJob(jobId: string, employerId: string): Promise<Job>;
    getModerationStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;
}
