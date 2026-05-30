import { Repository } from 'typeorm';
import { Resume } from '../resume.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class ResumesRepository extends BaseRepository<Resume> {
    protected resumeRepository: Repository<Resume>;
    constructor(resumeRepository: Repository<Resume>);
    findByStudentId(studentId: string, relations?: string[]): Promise<void | Resume[]>;
    findPrimary(studentId: string, relations?: string[]): Promise<void | Resume | null>;
    markAsPrimary(resumeId: string, studentId: string): Promise<void | import("typeorm").UpdateResult>;
}
