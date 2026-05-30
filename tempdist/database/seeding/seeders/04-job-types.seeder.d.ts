import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobType } from '../../../entities/master';
export declare class JobTypesSeeder implements Seeder {
    private readonly jobTypeRepository;
    private readonly logger;
    constructor(jobTypeRepository: Repository<JobType>);
    run(): Promise<void>;
}
