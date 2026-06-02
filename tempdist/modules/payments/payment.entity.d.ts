import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { PaymentStatus } from './enum/payment-status.enum';
export declare class Payment {
    id: string;
    employer: EmployerProfile;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string;
    transactionRef: string;
    planName: string;
    planType: string;
    jobPostLimit: number;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
