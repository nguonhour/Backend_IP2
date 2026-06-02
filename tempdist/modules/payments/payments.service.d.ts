import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AdminUpdatePaymentDto, UpdatePaymentDto } from './dto/update-payment.dto';
import type { GenerateQRResponse, PaymentOption } from 'aba-payway';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from './enum/payment-status.enum';
import { AbaPushbackPayload } from './interfaces/aba-pushback-payload.interface';
export declare function verifyPushbackSignature(payload: AbaPushbackPayload, providedHash: string, apiKey: string): boolean;
export declare function verifyRawBodySignature(rawBody: string, providedSignature: string, apiKey: string): boolean;
export declare class PaymentsService {
    private paymentRepository;
    private employerRepository;
    private readonly config;
    private payway;
    private readonly logger;
    private readonly sandboxTransactionOverrides;
    private formatAmount;
    private formatPaywayAmount;
    private toBase64;
    private createPaywayHash;
    private getPaywayBaseUrl;
    private isSandboxMode;
    private getPaywayResponseMessage;
    private filterPaywayParams;
    private generatePaywayQR;
    private formatPaywayRequestTime;
    private isQrPaymentOption;
    constructor(paymentRepository: Repository<Payment>, employerRepository: Repository<EmployerProfile>, config: ConfigService);
    updateStatusByTransactionRef(transactionRef: string, status: PaymentStatus): Promise<Payment | null>;
    handlePushback(payload: AbaPushbackPayload, signatureHeader?: string, rawBody?: string): Promise<{
        ok: boolean;
        payment?: Payment | null;
        reason?: string;
    }>;
    private validateEnv;
    private getEmployer;
    private getOptionalEmployer;
    private createPendingCheckoutPayment;
    createPayment(userId: string, dto: CreatePaymentDto): Promise<Payment>;
    createPaymentAdmin(dto: CreatePaymentDto): Promise<Payment>;
    getMyPayments(userId: string): Promise<Payment[]>;
    updateStatus(userId: string, paymentId: string, dto: UpdatePaymentDto): Promise<Payment>;
    deletePayment(userId: string, paymentId: string): Promise<{
        message: string;
    }>;
    private generateTransactionId;
    private getFrontendBaseUrl;
    private getBackendBaseUrl;
    createCheckout(userId: string | undefined, amount: number, opts?: {
        transactionId?: string;
        items?: string;
        planName?: string;
        shipping?: number;
        returnUrl?: string;
        cancelUrl?: string;
        continueSuccessUrl?: string;
        currency?: 'USD' | 'KHR';
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        paymentOption?: PaymentOption;
        planType?: string;
        jobPostLimit?: number;
    }): Promise<{
        transactionId: string;
        mode: string;
        qrResponse: GenerateQRResponse;
        expiresAt: string;
        continueUrl: string;
        checkoutParams?: undefined;
        abaBaseUrl?: undefined;
    } | {
        transactionId: string;
        mode: string;
        expiresAt: string;
        checkoutParams: import("aba-payway").CheckoutParams;
        abaBaseUrl: string;
        qrResponse?: undefined;
        continueUrl?: undefined;
    }>;
    checkTransactionStatus(transactionId: string): Promise<import("aba-payway").PayWayResponse<import("aba-payway").CheckTransactionData> | {
        status: {
            code: string;
            message: string;
            tran_id: string;
        };
        data: {
            payment_status_code: number;
            payment_status: string;
            transaction_id: string;
        };
    }>;
    markSandboxTransactionPaid(transactionId: string): Promise<{
        status: {
            code: string;
            message: string;
            tran_id: string;
        };
        data: {
            payment_status_code: number;
            payment_status: string;
            transaction_id: string;
        };
    }>;
    getAllPayments(status?: string, limit?: number, offset?: number): Promise<{
        data: Payment[];
        total: number;
    }>;
    getPaymentById(id: string): Promise<Payment>;
    updatePaymentStatusAdmin(id: string, status: PaymentStatus): Promise<Payment>;
    updatePaymentAdmin(id: string, dto: AdminUpdatePaymentDto): Promise<Payment>;
    deletePaymentAdmin(id: string): Promise<void>;
    getPaymentStats(startDate?: string, endDate?: string): Promise<{
        totalTransactions: number;
        totalAmount: number;
        byStatus: Record<string, number>;
        byMethod: Record<string, number>;
    }>;
}
