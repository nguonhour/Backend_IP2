import { Seeder } from '../seed.interface';
import { Repository } from 'typeorm';
import { Role } from '../../../entities/master';
export declare class RolesSeeder implements Seeder {
    private readonly roleRepository;
    private readonly logger;
    constructor(roleRepository: Repository<Role>);
    run(): Promise<void>;
}
