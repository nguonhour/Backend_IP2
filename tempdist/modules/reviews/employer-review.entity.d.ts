import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
export declare class EmployerReview {
    id: string;
    student: StudentProfile;
    employer: EmployerProfile;
    rating: number;
    reviewText: string;
    createdAt: Date;
}
