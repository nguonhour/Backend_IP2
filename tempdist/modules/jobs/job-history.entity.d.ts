import { Job } from './job.entity';
export declare class JobHistory {
    id: string;
    job: Job;
    title: string;
    description: string;
    salary_min: number;
    salary_max: number;
    updated_at: Date;
}
