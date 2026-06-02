import { Job } from '../../modules/jobs/job.entity';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
export declare class JobCategory {
    id: string;
    name: string;
    employer: EmployerProfile | null;
    isActive: boolean;
    createdAt: Date;
    jobs: Job[];
}
