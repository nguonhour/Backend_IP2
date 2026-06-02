import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { Industry } from '../../../entities/master';
export declare class IndustriesSeeder implements Seeder {
    private readonly industryRepository;
    private readonly logger;
    constructor(industryRepository: Repository<Industry>);
    run(): Promise<void>;
}
