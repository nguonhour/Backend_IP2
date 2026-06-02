import { ReportService } from './report.service';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { CreateReportDto, ResolveReportDto } from './dto/report.dto';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    createReport(dto: CreateReportDto, req: AuthenticatedRequest): Promise<import("./report.entity").Report>;
    getMyReports(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
        data: import("./report.entity").Report[];
        total: number;
    }>;
    getJobReports(jobId: string, page?: string, limit?: string): Promise<{
        data: import("./report.entity").Report[];
        total: number;
    }>;
    getReports(page?: string, limit?: string, status?: string, type?: string, jobId?: string): Promise<{
        data: import("./report.entity").Report[];
        total: number;
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    }>;
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
    getReport(reportId: string): Promise<import("./report.entity").Report>;
    updateReportStatus(reportId: string, dto: {
        status: string;
        adminNotes?: string;
    }, req: AuthenticatedRequest): Promise<import("./report.entity").Report>;
    resolveReport(reportId: string, dto: ResolveReportDto, req: AuthenticatedRequest): Promise<import("./report.entity").Report>;
    deleteReport(reportId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
