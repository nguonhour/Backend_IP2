import { StudentProfile } from './student-profile.entity';
import { Industry } from '../../entities/master/industry.entity';
export declare class StudentIndustry {
    id: string;
    studentId: string;
    industryId: string;
    createdAt: Date;
    student: StudentProfile;
    industry: Industry;
}
