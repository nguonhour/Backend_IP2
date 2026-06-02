import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { User } from '../../../modules/users/user.entity';
import { Role } from '../../../entities/master';
export declare class UsersSeeder implements Seeder {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    run(): Promise<void>;
    private hashPassword;
}
