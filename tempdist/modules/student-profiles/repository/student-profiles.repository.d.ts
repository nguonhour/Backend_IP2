import { Repository } from 'typeorm';
import { StudentProfile } from '../student-profile.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class StudentProfilesRepository extends BaseRepository<StudentProfile> {
    protected studentRepository: Repository<StudentProfile>;
    constructor(studentRepository: Repository<StudentProfile>);
    findByUserId(userId: string, relations?: string[]): Promise<void | StudentProfile | null>;
    findByUniversity(universityId: string, relations?: string[]): Promise<void | StudentProfile[]>;
    findByMajor(majorId: string, relations?: string[]): Promise<void | StudentProfile[]>;
    findVerified(relations?: string[]): Promise<void | StudentProfile[]>;
}
