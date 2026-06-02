import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
export declare class StudentCompanyPreference {
    id: string;
    student: StudentProfile;
    employer: EmployerProfile;
    blocked: boolean;
    muted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
