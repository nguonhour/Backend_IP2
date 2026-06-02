import { Repository } from 'typeorm';
import { JobStatus } from './job-status.entity';
import { ApplicationStatus } from './application-status.entity';
import { University } from './university.entity';
import { Major } from './major.entity';
import { JobCategory } from './job-category.entity';
import { JobType } from './job-type.entity';
export declare class MasterService {
    private jobCategoryRepository;
    private jobTypeRepository;
    private jobStatusRepository;
    private applicationStatusRepository;
    private universityRepository;
    private majorRepository;
    constructor(jobCategoryRepository: Repository<JobCategory>, jobTypeRepository: Repository<JobType>, jobStatusRepository: Repository<JobStatus>, applicationStatusRepository: Repository<ApplicationStatus>, universityRepository: Repository<University>, majorRepository: Repository<Major>);
    getJobStatuses(): Promise<JobStatus[]>;
    getJobCategories(): Promise<JobCategory[]>;
    getJobTypes(): Promise<JobType[]>;
    getApplicationStatuses(): Promise<ApplicationStatus[]>;
    getUniversities(): Promise<University[]>;
    getMajors(): Promise<Major[]>;
}
