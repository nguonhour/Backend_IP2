import { Repository } from 'typeorm';
import { Job } from '../job.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class JobsRepository extends BaseRepository<Job> {
    constructor(jobRepository: Repository<Job>);
    findByEmployerId(employerId: string, relations?: string[]): Promise<void | Job[]>;
    findActive(relations?: string[]): Promise<void | Job[]>;
    findByCategory(categoryId: string, relations?: string[]): Promise<void | Job[]>;
    findByLocation(location: string, relations?: string[]): Promise<void | Job[]>;
}
