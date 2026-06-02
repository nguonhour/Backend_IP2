import { ReportType } from '../report-type.enum';
export declare class CreateReportDto {
    type?: ReportType;
    description?: string;
    reason?: string;
    jobId?: string;
    metadata?: Record<string, any>;
}
export declare class ResolveReportDto {
    action: string;
    adminNotes: string;
}
