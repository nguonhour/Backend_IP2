import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AdminUpdatePaymentDto, UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import type { AbaPushbackPayload } from './interfaces/aba-pushback-payload.interface';
import { PaymentStatus } from './enum/payment-status.enum';
type CheckoutRequest = {
    user?: {
        id: string;
    };
};
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly config;
    constructor(paymentsService: PaymentsService, config: ConfigService);
    private getFrontendBaseUrl;
    private getBackendBaseUrl;
    createPayment(req: AuthenticatedRequest, dto: CreatePaymentDto): Promise<import("./payment.entity").Payment>;
    getMyPayments(req: AuthenticatedRequest): Promise<import("./payment.entity").Payment[]>;
    updateStatus(req: AuthenticatedRequest, id: string, dto: UpdatePaymentDto): Promise<import("./payment.entity").Payment>;
    deletePayment(req: AuthenticatedRequest, id: string): Promise<{
        message: string;
    }>;
    createCheckout(req: CheckoutRequest, dto: CreateCheckoutDto): Promise<{
        transactionId: string;
        mode: string;
        qrResponse: import("aba-payway").GenerateQRResponse;
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
    handleWebhook(body: AbaPushbackPayload, req: ExpressRequest & {
        rawBody?: Buffer;
    }): Promise<{
        status: string;
    }>;
    handleReturn(transactionId: string, res: Response): Promise<void>;
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
    testWebhook(transactionId: string): Promise<{
        ok: boolean;
        payment?: import("./payment.entity").Payment | null;
        reason?: string;
    }>;
    getAllPayments(req: AuthenticatedRequest, status?: string, limit?: number, offset?: number): Promise<{
        data: import("./payment.entity").Payment[];
        total: number;
    }>;
    createPaymentAdmin(req: AuthenticatedRequest, dto: CreatePaymentDto): Promise<import("./payment.entity").Payment>;
    getPaymentById(req: AuthenticatedRequest, id: string): Promise<import("./payment.entity").Payment>;
    updatePaymentAdmin(req: AuthenticatedRequest, id: string, dto: AdminUpdatePaymentDto): Promise<import("./payment.entity").Payment>;
    updatePaymentStatus(id: string, body: {
        status: PaymentStatus;
    }, req: AuthenticatedRequest): Promise<import("./payment.entity").Payment>;
    deletePaymentAdmin(req: AuthenticatedRequest, id: string): Promise<void>;
    getPaymentStats(req: AuthenticatedRequest, startDate?: string, endDate?: string): Promise<{
        totalTransactions: number;
        totalAmount: number;
        byStatus: Record<string, number>;
        byMethod: Record<string, number>;
    }>;
}
export {};
