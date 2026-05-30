import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';
import { Job } from '../jobs/job.entity';
import { EmployerReview } from '../reviews/employer-review.entity';
import { Payment } from '../payments/payment.entity';
export declare class EmployerProfile {
    id: string;
    user: User;
    companyName: string;
    industry: Industry;
    location: string;
    contactEmail: string;
    avatarUrl: string | null;
    about: string | null;
    companySize: string | null;
    foundedAt: Date | null;
    website: string | null;
    phone: string | null;
    currentPlanType: string;
    jobPostLimit: number;
    createdAt: Date;
    updatedAt: Date;
    jobs: Job[];
    reviews: EmployerReview[];
    payments: Payment[];
}
