import { Repository } from 'typeorm';
import { StudentCompanyPreference } from './student-company-preference.entity';
export declare class StudentCompanyPreferencesService {
    private repo;
    constructor(repo: Repository<StudentCompanyPreference>);
    upsert(studentId: string, employerId: string, payload: {
        blocked?: boolean;
        muted?: boolean;
    }): Promise<StudentCompanyPreference | StudentCompanyPreference[]>;
    findByStudent(studentId: string): Promise<StudentCompanyPreference[]>;
}
