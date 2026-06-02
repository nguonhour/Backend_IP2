import { Job } from '../../modules/jobs/job.entity';
export declare class JobStatus {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    jobs: Job[];
}
