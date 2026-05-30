import { Job } from '../../modules/jobs/job.entity';
export declare enum TypeJob {
    OnSite = "On-site",
    Remote = "Remote",
    Hybrid = "Hybrid"
}
export declare class JobType {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    jobs: Job[];
}
