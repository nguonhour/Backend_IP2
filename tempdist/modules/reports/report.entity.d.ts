import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { ReportType } from './report-type.enum';
import { ReportStatus } from './report-status.enum';
export declare class Report {
    id: string;
    userId: string;
    user: User;
    jobId: string | null;
    job: Job | null;
    type: ReportType;
    status: ReportStatus;
    description: string;
    reason: string | null;
    adminNotes: string | null;
    resolvedByAdminId: string | null;
    resolvedAt: Date | null;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
