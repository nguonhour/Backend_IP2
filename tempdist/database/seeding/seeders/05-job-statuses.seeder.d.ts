import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobStatus } from '../../../entities/master';
export declare class JobStatusesSeeder implements Seeder {
    private readonly jobStatusRepository;
    private readonly logger;
    constructor(jobStatusRepository: Repository<JobStatus>);
    run(): Promise<void>;
}
