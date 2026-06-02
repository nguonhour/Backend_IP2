import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobCategory } from '../../../entities/master';
export declare class JobCategoriesSeeder implements Seeder {
    private readonly jobCategoryRepository;
    private readonly logger;
    constructor(jobCategoryRepository: Repository<JobCategory>);
    run(): Promise<void>;
}
