import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';
export declare class University {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    students: StudentProfile[];
}
