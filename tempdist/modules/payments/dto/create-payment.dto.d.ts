import { PaymentStatus } from '../enum/payment-status.enum';
export declare class CreatePaymentDto {
    amount: number;
    currency: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    transactionRef?: string;
    planName?: string;
    planType?: string;
    jobPostLimit?: number;
    expiresAt?: string;
    employerId?: string;
}
