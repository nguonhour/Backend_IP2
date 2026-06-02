import { MasterService } from './master.service';
export declare class MasterController {
    private readonly masterService;
    constructor(masterService: MasterService);
    getJobStatuses(): Promise<import("./job-status.entity").JobStatus[]>;
    getJobCategories(): Promise<import("./job-category.entity").JobCategory[]>;
    getJobTypes(): Promise<import("./job-type.entity").JobType[]>;
    getApplicationStatuses(): Promise<import("./application-status.entity").ApplicationStatus[]>;
    getUniversities(): Promise<import("./university.entity").University[]>;
    getMajors(): Promise<import("./major.entity").Major[]>;
}
