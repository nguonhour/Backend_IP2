import { Repository } from 'typeorm';
import { EmployerProfile } from '../employer-profile.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class EmployerProfilesRepository extends BaseRepository<EmployerProfile> {
    protected employerRepository: Repository<EmployerProfile>;
    constructor(employerRepository: Repository<EmployerProfile>);
    findByUserId(userId: string, relations?: string[]): Promise<void | EmployerProfile | null>;
    findByCompanyName(companyName: string, relations?: string[]): Promise<void | EmployerProfile[]>;
    findVerified(relations?: string[]): Promise<void | EmployerProfile[]>;
}
