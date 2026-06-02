import { PaymentStatus } from '../enum/payment-status.enum';
export declare class UpdatePaymentDto {
    status: PaymentStatus;
}
export declare class AdminUpdatePaymentDto {
    amount?: number;
    currency?: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    transactionRef?: string;
    planName?: string;
    planType?: string;
    jobPostLimit?: number;
    expiresAt?: string | null;
    employerId?: string | null;
}
