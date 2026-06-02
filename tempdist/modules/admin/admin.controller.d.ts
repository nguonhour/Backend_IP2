import { AdminService } from './admin.service';
import { UserManagementService } from './user-management.service';
import { JobModerationService } from './job-moderation.service';
import { SuspendUserDto } from './dto/admin-user-management.dto';
import { RejectJobDto } from './dto/job-moderation.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
export declare class AdminController {
    private readonly adminService;
    private readonly userManagementService;
    private readonly jobModerationService;
    constructor(adminService: AdminService, userManagementService: UserManagementService, jobModerationService: JobModerationService);
    getDashboard(): Promise<{
        totalStudents: number;
        totalEmployers: number;
        totalJobs: number;
        newApplicantsToday: number;
        totalReports: number;
        pendingReports: number;
        totalRevenue: number;
    }>;
    getUsers(status?: string, search?: string, page?: string, limit?: string): Promise<{
        data: import("../users/user.entity").User[];
        total: number;
    }>;
    getPendingApprovals(page?: string, limit?: string): Promise<{
        data: import("../users/user.entity").User[];
        total: number;
    }>;
    getSuspendedUsers(page?: string, limit?: string): Promise<{
        data: import("../users/user.entity").User[];
        total: number;
    }>;
    getUser(userId: string): Promise<import("../users/user.entity").User>;
    suspendUser(userId: string, dto: SuspendUserDto, req: AuthenticatedRequest): Promise<import("../users/user.entity").User>;
    unsuspendUser(userId: string, req: AuthenticatedRequest): Promise<import("../users/user.entity").User>;
    verifyEmployer(userId: string, req: AuthenticatedRequest): Promise<import("../users/user.entity").User>;
    rejectEmployer(userId: string, dto: SuspendUserDto, req: AuthenticatedRequest): Promise<import("../users/user.entity").User>;
    deleteUser(userId: string, req: AuthenticatedRequest): Promise<import("../users/user.entity").User>;
    getModerationStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;
    getPendingJobs(page?: string, limit?: string): Promise<{
        data: import("../jobs/job.entity").Job[];
        total: number;
    }>;
    getApprovedJobs(page?: string, limit?: string): Promise<{
        data: import("../jobs/job.entity").Job[];
        total: number;
    }>;
    getRejectedJobs(page?: string, limit?: string): Promise<{
        data: import("../jobs/job.entity").Job[];
        total: number;
    }>;
    getJobForModeration(jobId: string): Promise<import("../jobs/job.entity").Job>;
    approveJob(jobId: string, req: AuthenticatedRequest): Promise<import("../jobs/job.entity").Job>;
    rejectJob(jobId: string, dto: RejectJobDto, req: AuthenticatedRequest): Promise<import("../jobs/job.entity").Job>;
}
