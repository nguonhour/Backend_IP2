import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { EmployerApplicationHistoryDto } from './dto/employer-application-history.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    getAllApplications(today?: string, hired?: string): Promise<import("./application.entity").Application[]>;
    applyToJob(req: AuthenticatedRequest, dto: CreateApplicationDto): Promise<import("./application.entity").Application>;
    getMyApplications(req: AuthenticatedRequest, status?: string): Promise<import("./application.entity").Application[]>;
    getEmployerDashboard(req: AuthenticatedRequest): Promise<{
        stats: {
            activeJobs: number;
            activeJobsDelta: number;
            totalApplicants: number;
            newApplicantsToday: number;
            hiredThisMonth: number;
            hiredGoalPercent: number;
        };
        pipeline: {
            pending: number;
            reviewed: number;
            interviewing: number;
            offered: number;
            rejected: number;
        };
        recentApplications: import("./application.entity").Application[];
    }>;
    getEmployerInbox(req: AuthenticatedRequest, jobId?: string, status?: string): Promise<import("./application.entity").Application[]>;
    getEmployerApplicationHistory(req: AuthenticatedRequest, query: EmployerApplicationHistoryDto): Promise<import("./application-status-history.entity").ApplicationStatusHistory[]>;
    getApplicantsForJob(req: AuthenticatedRequest, jobId: string, status?: string): Promise<import("./application.entity").Application[]>;
    getEmployerApplicationById(req: AuthenticatedRequest, id: string): Promise<import("./application.entity").Application>;
    updateApplicationStatus(req: AuthenticatedRequest, id: string, dto: UpdateApplicationStatusDto): Promise<import("./application.entity").Application>;
    getStudentApplicationHistory(req: AuthenticatedRequest, id: string): Promise<import("./application-status-history.entity").ApplicationStatusHistory[]>;
    getApplicationById(req: AuthenticatedRequest, id: string): Promise<import("./application.entity").Application>;
}
