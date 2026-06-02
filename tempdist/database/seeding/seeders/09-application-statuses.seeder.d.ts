import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { ApplicationStatus } from '../../../entities/master/application-status.entity';
export declare class ApplicationStatusesSeeder implements Seeder {
    private readonly applicationStatusRepository;
    private readonly logger;
    constructor(applicationStatusRepository: Repository<ApplicationStatus>);
    run(): Promise<void>;
}
