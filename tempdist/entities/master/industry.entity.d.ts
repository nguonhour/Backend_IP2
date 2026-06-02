import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
import { StudentIndustry } from '../../modules/student-profiles/student-industry.entity';
export declare class Industry {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    employers: EmployerProfile[];
    studentIndustries: StudentIndustry[];
}
