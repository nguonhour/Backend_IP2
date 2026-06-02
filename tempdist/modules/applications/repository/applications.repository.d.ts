import { Repository } from 'typeorm';
import { Application } from '../application.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class ApplicationsRepository extends BaseRepository<Application> {
    constructor(applicationRepository: Repository<Application>);
    findByStudentId(studentId: string, relations?: string[]): Promise<void | Application[]>;
    findByJobId(jobId: string, relations?: string[]): Promise<void | Application[]>;
    findByStudentAndJob(studentId: string, jobId: string): Promise<void | Application | null>;
}
