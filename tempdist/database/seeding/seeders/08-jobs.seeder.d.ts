import { Seeder } from '../seed.interface';
import { Repository } from 'typeorm';
import { Job } from '../../../modules/jobs/job.entity';
import { JobCategory, JobStatus, JobType } from '../../../entities/master';
import { EmployerProfile } from '../../../modules/employer-profiles/employer-profile.entity';
import { User } from '../../../modules/users/user.entity';
export declare class JobsSeeder implements Seeder {
    private readonly userRepository;
    private readonly employerProfileRepository;
    private readonly jobRepository;
    private readonly jobTypeRepository;
    private readonly jobStatusRepository;
    private readonly jobCategoryRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, employerProfileRepository: Repository<EmployerProfile>, jobRepository: Repository<Job>, jobTypeRepository: Repository<JobType>, jobStatusRepository: Repository<JobStatus>, jobCategoryRepository: Repository<JobCategory>);
    run(): Promise<void>;
}
