import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { EmployerProfile } from '../../../modules/employer-profiles/employer-profile.entity';
import { User } from '../../../modules/users/user.entity';
import { Industry } from '../../../entities/master';
export declare class EmployerProfilesSeeder implements Seeder {
    private readonly employerProfileRepository;
    private readonly userRepository;
    private readonly industryRepository;
    private readonly logger;
    constructor(employerProfileRepository: Repository<EmployerProfile>, userRepository: Repository<User>, industryRepository: Repository<Industry>);
    run(): Promise<void>;
}
