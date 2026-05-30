"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
exports.verifyPushbackSignature = verifyPushbackSignature;
exports.verifyRawBodySignature = verifyRawBodySignature;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const aba_payway_1 = require("aba-payway");
const crypto = __importStar(require("crypto"));
const file_logger_1 = require("../../common/logger/file-logger");
const config_1 = require("@nestjs/config");
const payment_status_enum_1 = require("./enum/payment-status.enum");
function verifyPushbackSignature(payload, providedHash, apiKey) {
    const reqTime = String(payload.req_time ?? payload.reqTime ?? '');
    const merchantId = String(payload.merchant_id ?? payload.merchantId ?? '');
    const tranId = String(payload.tran_id ?? payload.tranId ?? payload.transactionId ?? '');
    const amount = String(payload.amount ?? '');
    const base = `${reqTime}${merchantId}${tranId}${amount}`;
    const hmacHex = crypto
        .createHmac('sha256', apiKey)
        .update(base)
        .digest('hex');
    const expectBuf = Buffer.from(hmacHex.toLowerCase());
    const actualBuf = Buffer.from(String(providedHash ?? '').toLowerCase());
    if (expectBuf.length !== actualBuf.length)
        return false;
    return crypto.timingSafeEqual(expectBuf, actualBuf);
}
function verifyRawBodySignature(rawBody, providedSignature, apiKey) {
    const raw = String(rawBody ?? '');
    const sig = String(providedSignature ?? '').trim();
    if (!raw || !sig)
        return false;
    const cleanSig = sig.replace(/^sha256=/i, '').toLowerCase();
    const hmacHex = crypto.createHmac('sha256', apiKey).update(raw).digest('hex');
    const hmacBase64 = crypto
        .createHmac('sha256', apiKey)
        .update(raw)
        .digest('base64')
        .toLowerCase();
    return cleanSig === hmacHex.toLowerCase() || cleanSig === hmacBase64;
}
let PaymentsService = PaymentsService_1 = class PaymentsService {
    paymentRepository;
    employerRepository;
    config;
    payway;
    logger = new common_1.Logger(PaymentsService_1.name);
    sandboxTransactionOverrides = new Map();
    formatAmount(amount, currency = 'KHR') {
        if (Number.isNaN(Number(amount)))
            throw new common_1.BadRequestException('Invalid amount');
        if (currency === 'KHR') {
            return Math.round(amount);
        }
        return Math.round(amount * 100) / 100;
    }
    formatPaywayAmount(amount, currency = 'USD') {
        if (currency === 'KHR') {
            return Math.round(amount).toString();
        }
        return amount.toFixed(2);
    }
    toBase64(value) {
        return Buffer.from(value).toString('base64');
    }
    createPaywayHash(values, algorithm = 'sha512', encoding = 'base64') {
        const apiKey = this.config.get('ABA_API_KEY') ?? '';
        return crypto
            .createHmac(algorithm, apiKey)
            .update(values.join(''))
            .digest(encoding);
    }
    getPaywayBaseUrl() {
        const configured = this.config.get('ABA_BASE_URL') ?? '';
        if (configured.trim())
            return configured.trim().replace(/\/+$/, '');
        return this.config.get('NODE_ENV') === 'production'
            ? 'https://checkout.payway.com.kh'
            : 'https://checkout-sandbox.payway.com.kh';
    }
    isSandboxMode() {
        return (this.config.get('NODE_ENV') !== 'production' &&
            this.getPaywayBaseUrl().includes('sandbox'));
    }
    getPaywayResponseMessage(error) {
        const responseBody = error.responseBody;
        const message = responseBody?.status?.message;
        return typeof message === 'string' && message.trim()
            ? message
            : error.message;
    }
    filterPaywayParams(params) {
        return Object.fromEntries(Object.entries(params).filter(([, value]) => {
            return value !== undefined && value !== null && value !== '';
        }));
    }
    async generatePaywayQR(options) {
        const reqTime = this.formatPaywayRequestTime();
        const currency = options.currency ?? 'USD';
        const amountStr = options.amount.toString();
        const items = options.items ? this.toBase64(options.items) : '';
        const callbackUrl = options.callbackUrl
            ? this.toBase64(options.callbackUrl)
            : '';
        const returnDeeplink = options.returnDeeplink
            ? this.toBase64(options.returnDeeplink)
            : '';
        const customFields = options.customFields
            ? this.toBase64(options.customFields)
            : '';
        const payout = options.payout ? this.toBase64(options.payout) : '';
        const hash = this.createPaywayHash([
            reqTime,
            this.config.get('ABA_MERCHANT_ID') ?? '',
            options.transactionId,
            amountStr,
            items,
            options.firstName ?? '',
            options.lastName ?? '',
            options.email ?? '',
            options.phone ?? '',
            options.purchaseType ?? '',
            options.paymentOption,
            callbackUrl,
            returnDeeplink,
            currency,
            customFields,
            options.returnParams ?? '',
            payout,
            options.lifetime.toString(),
            options.qrImageTemplate ?? '',
        ], 'sha512', 'base64');
        const response = await fetch(`${this.getPaywayBaseUrl()}/api/payment-gateway/v1/payments/generate-qr`, {
            method: 'POST',
            body: JSON.stringify(this.filterPaywayParams({
                hash,
                req_time: reqTime,
                merchant_id: this.config.get('ABA_MERCHANT_ID') ?? '',
                tran_id: options.transactionId,
                amount: amountStr,
                currency,
                payment_option: options.paymentOption,
                lifetime: options.lifetime,
                qr_image_template: options.qrImageTemplate,
                first_name: options.firstName,
                last_name: options.lastName,
                email: options.email,
                phone: options.phone,
                purchase_type: options.purchaseType,
                items,
                callback_url: callbackUrl,
                return_deeplink: returnDeeplink,
                custom_fields: customFields,
                return_params: options.returnParams,
                payout,
            })),
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
            const text = await response.text();
            console.error(`[PaymentsService] API Call Failed`);
            console.error(`URL: ${this.getPaywayBaseUrl()}/api/payment-gateway/v1/payments/generate-qr`);
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error(`Response: ${text || '(empty)'}`);
            console.error(`Merchant ID: ${this.config.get('ABA_MERCHANT_ID')}`);
            let responseBody = text;
            try {
                responseBody = JSON.parse(text);
            }
            catch {
            }
            throw new aba_payway_1.PayWayAPIError(`PayWay API error: ${response.status} ${response.statusText}`, response.status, responseBody);
        }
        return (await response.json());
    }
    formatPaywayRequestTime(date = new Date()) {
        const year = date.getUTCFullYear().toString();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
    isQrPaymentOption(paymentOption) {
        return (paymentOption === 'abapay_khqr' ||
            paymentOption === 'abapay_khqr_deeplink');
    }
    constructor(paymentRepository, employerRepository, config) {
        this.paymentRepository = paymentRepository;
        this.employerRepository = employerRepository;
        this.config = config;
        this.validateEnv();
        this.payway = new aba_payway_1.PayWay({
            merchantId: this.config.get('ABA_MERCHANT_ID') ?? '',
            apiKey: this.config.get('ABA_API_KEY') ?? '',
            environment: this.config.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
        });
    }
    async updateStatusByTransactionRef(transactionRef, status) {
        const payment = await this.paymentRepository.findOne({
            where: { transactionRef },
            relations: ['employer'],
        });
        if (!payment)
            return null;
        if (String(payment.status) === 'PAID' && String(status) === 'PAID') {
            return payment;
        }
        payment.status = status;
        if (status === payment_status_enum_1.PaymentStatus.PAID &&
            payment.employer &&
            payment.planType &&
            payment.jobPostLimit !== undefined) {
            try {
                await this.employerRepository.update({ id: payment.employer.id }, {
                    currentPlanType: payment.planType,
                    jobPostLimit: payment.jobPostLimit,
                });
            }
            catch (err) {
                this.logger.warn('Failed to update employer profile on payment success', err);
            }
        }
        return this.paymentRepository.save(payment);
    }
    async handlePushback(payload, signatureHeader, rawBody) {
        try {
            const apiKey = this.config.get('ABA_API_KEY') ?? '';
            const tranId = String(payload.tran_id ?? payload.tranId ?? payload.transactionId ?? '');
            const providedHash = String(signatureHeader ??
                payload.hash ??
                payload.signature ??
                payload.hmac ??
                '');
            if (!providedHash) {
                this.logger.warn('Pushback missing hash/signature');
                return { ok: false, reason: 'missing_signature' };
            }
            let ok = false;
            if (signatureHeader && rawBody) {
                ok = verifyRawBodySignature(rawBody, signatureHeader, apiKey);
            }
            if (!ok) {
                ok = verifyPushbackSignature(payload, providedHash, apiKey);
            }
            if (!ok) {
                this.logger.warn('Pushback signature verification failed', providedHash);
                try {
                    (0, file_logger_1.logErrorToFile)(new Error('Invalid pushback signature'), {
                        service: 'PaymentsService',
                        method: 'handlePushback',
                        payload: JSON.stringify(payload),
                    });
                }
                catch {
                }
                return { ok: false, reason: 'invalid_signature' };
            }
            const rawCode = String(payload.status ?? payload.status_code ?? payload.code ?? '').trim();
            let newStatus = payment_status_enum_1.PaymentStatus.PENDING;
            if (rawCode === '0' ||
                rawCode === '00' ||
                rawCode.toUpperCase() === 'SUCCESS' ||
                rawCode.toUpperCase() === 'APPROVED') {
                newStatus = payment_status_enum_1.PaymentStatus.PAID;
            }
            else if (rawCode.toUpperCase() === 'FAILED' ||
                rawCode.toUpperCase() === 'DECLINED' ||
                rawCode.toUpperCase() === 'CANCELLED') {
                newStatus = payment_status_enum_1.PaymentStatus.FAILED;
            }
            const updated = await this.updateStatusByTransactionRef(tranId, newStatus);
            return { ok: true, payment: updated ?? null };
        }
        catch (err) {
            this.logger.error('Error handling pushback', err);
            try {
                (0, file_logger_1.logErrorToFile)(err, {
                    service: 'PaymentsService',
                    method: 'handlePushback',
                });
            }
            catch {
            }
            return { ok: false, reason: 'exception' };
        }
    }
    validateEnv() {
        const missing = [];
        const merchantId = this.config.get('ABA_MERCHANT_ID');
        const apiKey = this.config.get('ABA_API_KEY');
        if (!merchantId)
            missing.push('ABA_MERCHANT_ID');
        if (!apiKey)
            missing.push('ABA_API_KEY');
        if (missing.length) {
            const msg = `Missing required ABA Payway env: ${missing.join(', ')}`;
            this.logger.error(msg);
            try {
                (0, file_logger_1.logErrorToFile)(new Error(msg), {
                    service: 'PaymentsService',
                    context: 'validateEnv',
                });
            }
            catch (error) {
                console.error('Failed to log missing env error:', error);
            }
            throw new Error(msg);
        }
        if (apiKey?.startsWith('http://') || apiKey?.startsWith('https://')) {
            const msg = 'Invalid ABA_API_KEY: expected secret key from ABA merchant portal, but received a URL';
            this.logger.error(msg);
            throw new Error(msg);
        }
    }
    async getEmployer(userId) {
        const employer = await this.employerRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!employer)
            throw new common_1.NotFoundException('Employer profile not found');
        return employer;
    }
    async getOptionalEmployer(userId) {
        if (!userId)
            return null;
        return this.employerRepository.findOne({
            where: { user: { id: userId } },
        });
    }
    async createPendingCheckoutPayment(userId, opts) {
        const employer = await this.getOptionalEmployer(userId);
        const existing = await this.paymentRepository.findOne({
            where: { transactionRef: opts.transactionId },
            relations: ['employer'],
        });
        if (existing) {
            let changed = false;
            if (employer && !existing.employer) {
                existing.employer = { id: employer.id };
                changed = true;
            }
            if (opts.planName && !existing.planName) {
                existing.planName = opts.planName;
                changed = true;
            }
            if (opts.planType && !existing.planType) {
                existing.planType = opts.planType;
                changed = true;
            }
            if (opts.jobPostLimit && !existing.jobPostLimit) {
                existing.jobPostLimit = opts.jobPostLimit;
                changed = true;
            }
            if (opts.expiresAt && !existing.expiresAt) {
                existing.expiresAt = opts.expiresAt;
                changed = true;
            }
            return changed ? this.paymentRepository.save(existing) : existing;
        }
        const payment = this.paymentRepository.create({
            employer: employer ? { id: employer.id } : undefined,
            amount: opts.amount,
            currency: opts.currency,
            status: payment_status_enum_1.PaymentStatus.PENDING,
            paymentMethod: opts.paymentMethod,
            transactionRef: opts.transactionId,
            planName: opts.planName,
            planType: opts.planType,
            jobPostLimit: opts.jobPostLimit,
            expiresAt: opts.expiresAt ?? null,
        });
        return this.paymentRepository.save(payment);
    }
    async createPayment(userId, dto) {
        const employer = await this.getEmployer(userId);
        const payment = this.paymentRepository.create({
            employer: { id: employer.id },
            amount: dto.amount,
            currency: dto.currency,
            status: dto.status ?? payment_status_enum_1.PaymentStatus.PENDING,
            paymentMethod: dto.paymentMethod,
            transactionRef: dto.transactionRef,
            planName: dto.planName,
        });
        return this.paymentRepository.save(payment);
    }
    async createPaymentAdmin(dto) {
        if (!dto.employerId) {
            throw new common_1.BadRequestException('Employer ID is required');
        }
        const employer = await this.employerRepository.findOne({
            where: { id: dto.employerId },
        });
        if (!employer) {
            throw new common_1.NotFoundException('Employer profile not found');
        }
        const payment = this.paymentRepository.create({
            employer: employer ? { id: employer.id } : undefined,
            amount: dto.amount,
            currency: dto.currency,
            status: dto.status ?? payment_status_enum_1.PaymentStatus.PENDING,
            paymentMethod: dto.paymentMethod,
            transactionRef: dto.transactionRef,
            planName: dto.planName,
            planType: dto.planType,
            jobPostLimit: dto.jobPostLimit,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        });
        return this.paymentRepository.save(payment);
    }
    async getMyPayments(userId) {
        const employer = await this.getEmployer(userId);
        const includeLegacyUnowned = this.config.get('NODE_ENV') !== 'production' ||
            this.config.get('PAYMENTS_INCLUDE_LEGACY_UNOWNED') === 'true';
        const query = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoin('payment.employer', 'employer')
            .where('employer.id = :employerId', { employerId: employer.id });
        if (includeLegacyUnowned) {
            query.orWhere('payment.employer_id IS NULL');
        }
        return query.orderBy('payment.createdAt', 'DESC').getMany();
    }
    async updateStatus(userId, paymentId, dto) {
        const employer = await this.getEmployer(userId);
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, employer: { id: employer.id } },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.status = dto.status;
        return this.paymentRepository.save(payment);
    }
    async deletePayment(userId, paymentId) {
        const employer = await this.getEmployer(userId);
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, employer: { id: employer.id } },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        await this.paymentRepository.remove(payment);
        return { message: 'Payment deleted successfully' };
    }
    generateTransactionId() {
        return crypto.randomBytes(10).toString('hex');
    }
    getFrontendBaseUrl() {
        const configured = this.config.get('FRONTEND_URL') ?? '';
        const fallback = 'http://localhost:5173';
        const base = configured.trim() || fallback;
        return base.replace(/\/+$/, '');
    }
    getBackendBaseUrl() {
        const configured = this.config.get('BACKEND_URL') ?? '';
        const fallback = 'http://localhost:3211';
        const base = configured.trim() || fallback;
        return base.replace(/\/+$/, '');
    }
    async createCheckout(userId, amount, opts) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Invalid amount');
        }
        const rawTran = String(opts?.transactionId ?? this.generateTransactionId());
        const transactionId = rawTran.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        if (!transactionId || transactionId.length === 0) {
            throw new common_1.BadRequestException('Invalid transaction ID');
        }
        try {
            const frontendBaseUrl = this.getFrontendBaseUrl();
            const currency = opts?.currency ?? 'KHR';
            const amountValue = this.formatAmount(amount, currency);
            const paymentOption = opts?.paymentOption;
            const planName = opts?.planName ??
                String(opts?.items ?? 'Employer subscription').replace(/\s+subscription$/i, '');
            const lifetimeMinutes = 30;
            const expiresAt = new Date(Date.now() + lifetimeMinutes * 60 * 1000);
            await this.createPendingCheckoutPayment(userId, {
                transactionId,
                amount: amountValue,
                currency,
                paymentMethod: paymentOption,
                planName,
                planType: opts?.planType,
                jobPostLimit: opts?.jobPostLimit,
                expiresAt,
            });
            const itemsArray = [
                {
                    name: opts?.items ?? 'Student Portal Payment',
                    quantity: '1',
                    price: (Number(amountValue) || 0).toFixed(2),
                },
            ];
            const qrItems = JSON.stringify(itemsArray);
            const resultPageUrl = `${frontendBaseUrl}/payment/result?transactionId=${transactionId}`;
            const cancelPageUrl = `${frontendBaseUrl}/payment/result?transactionId=${transactionId}&status=CANCELLED`;
            if (this.isQrPaymentOption(paymentOption)) {
                const qrImageTemplate = this.config.get('ABA_QR_IMAGE_TEMPLATE') ?? 'template1';
                const qrPayload = {
                    transactionId,
                    amount: amountValue,
                    currency,
                    paymentOption,
                    qrImageTemplate,
                    lifetime: lifetimeMinutes,
                    firstName: opts?.firstName,
                    lastName: opts?.lastName,
                    email: opts?.email,
                    phone: opts?.phone,
                    purchaseType: 'purchase',
                    items: qrItems,
                    returnParams: transactionId,
                };
                this.logger.debug('Generating QR with payload', JSON.stringify(qrPayload));
                const qrResponse = await this.generatePaywayQR(qrPayload);
                return {
                    transactionId,
                    mode: 'qr',
                    qrResponse,
                    expiresAt: expiresAt.toISOString(),
                    continueUrl: opts?.continueSuccessUrl ??
                        this.config.get('ABA_CONTINUE_SUCCESS_URL') ??
                        `${frontendBaseUrl}/dashboard`,
                };
            }
            const checkoutParams = this.payway.createTransaction({
                transactionId,
                amount: amountValue,
                currency,
                items: itemsArray,
                paymentOption,
                viewType: 'hosted_view',
                shipping: this.formatAmount(opts?.shipping ?? 0, currency),
                returnUrl: opts?.returnUrl ??
                    this.config.get('ABA_RETURN_URL') ??
                    resultPageUrl,
                cancelUrl: opts?.cancelUrl ??
                    this.config.get('ABA_CANCEL_URL') ??
                    cancelPageUrl,
                continueSuccessUrl: opts?.continueSuccessUrl ??
                    this.config.get('ABA_CONTINUE_SUCCESS_URL') ??
                    resultPageUrl,
                firstName: opts?.firstName,
                lastName: opts?.lastName,
                email: opts?.email,
                phone: opts?.phone,
            });
            return {
                transactionId,
                mode: 'checkout',
                expiresAt: expiresAt.toISOString(),
                checkoutParams,
                abaBaseUrl: this.config.get('ABA_BASE_URL') ??
                    'https://checkout-sandbox.payway.com.kh',
            };
        }
        catch (err) {
            this.logger.error('Failed to create ABA checkout params', err);
            try {
                (0, file_logger_1.logErrorToFile)(err, {
                    service: 'PaymentsService',
                    method: 'createCheckout',
                    userId,
                    amount,
                });
            }
            catch (error) {
                console.error('Failed to log missing env error:', error);
            }
            if (err instanceof aba_payway_1.PayWayAPIError) {
                throw new common_1.BadRequestException(this.getPaywayResponseMessage(err));
            }
            throw new common_1.InternalServerErrorException('Failed to create checkout parameters');
        }
    }
    async checkTransactionStatus(transactionId) {
        try {
            const sandboxStatus = this.sandboxTransactionOverrides.get(transactionId);
            if (sandboxStatus) {
                return {
                    status: {
                        code: sandboxStatus === payment_status_enum_1.PaymentStatus.PAID ? '00' : '01',
                        message: 'Sandbox override',
                        tran_id: transactionId,
                    },
                    data: {
                        payment_status_code: sandboxStatus === payment_status_enum_1.PaymentStatus.PAID ? 0 : 1,
                        payment_status: sandboxStatus === payment_status_enum_1.PaymentStatus.PAID ? 'APPROVED' : sandboxStatus,
                        transaction_id: transactionId,
                    },
                };
            }
            const result = await this.payway.checkTransaction(transactionId);
            return result;
        }
        catch (err) {
            this.logger.error(`Failed to check transaction ${transactionId}`, err);
            try {
                (0, file_logger_1.logErrorToFile)(err, {
                    service: 'PaymentsService',
                    method: 'checkTransactionStatus',
                    transactionId,
                });
            }
            catch (error) {
                console.error('Failed to log missing env error:', error);
            }
            if (err instanceof aba_payway_1.PayWayAPIError) {
                throw new common_1.InternalServerErrorException(err.message);
            }
            throw new common_1.InternalServerErrorException('Failed to check transaction');
        }
    }
    async markSandboxTransactionPaid(transactionId) {
        if (!this.isSandboxMode()) {
            throw new common_1.ForbiddenException('Sandbox transaction override is only available in sandbox mode');
        }
        const cleanTransactionId = String(transactionId ?? '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 20);
        if (!cleanTransactionId) {
            throw new common_1.BadRequestException('Invalid transaction ID');
        }
        this.sandboxTransactionOverrides.set(cleanTransactionId, payment_status_enum_1.PaymentStatus.PAID);
        await this.updateStatusByTransactionRef(cleanTransactionId, payment_status_enum_1.PaymentStatus.PAID);
        return {
            status: {
                code: '00',
                message: 'Sandbox transaction marked as paid',
                tran_id: cleanTransactionId,
            },
            data: {
                payment_status_code: 0,
                payment_status: 'APPROVED',
                transaction_id: cleanTransactionId,
            },
        };
    }
    async getAllPayments(status, limit = 50, offset = 0) {
        const query = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.employer', 'employer');
        if (status) {
            query.where('payment.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('payment.createdAt', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return { data, total };
    }
    async getPaymentById(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['employer'],
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async updatePaymentStatusAdmin(id, status) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.status = status;
        return this.paymentRepository.save(payment);
    }
    async updatePaymentAdmin(id, dto) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['employer'],
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (dto.employerId !== undefined) {
            if (dto.employerId === null) {
                throw new common_1.BadRequestException('Employer ID is required');
            }
            const employer = await this.employerRepository.findOne({
                where: { id: dto.employerId },
            });
            if (!employer)
                throw new common_1.NotFoundException('Employer profile not found');
            payment.employer = employer;
        }
        if (dto.amount !== undefined)
            payment.amount = dto.amount;
        if (dto.currency !== undefined)
            payment.currency = dto.currency;
        if (dto.status !== undefined)
            payment.status = dto.status;
        if (dto.paymentMethod !== undefined)
            payment.paymentMethod = dto.paymentMethod;
        if (dto.transactionRef !== undefined)
            payment.transactionRef = dto.transactionRef;
        if (dto.planName !== undefined)
            payment.planName = dto.planName;
        if (dto.planType !== undefined)
            payment.planType = dto.planType;
        if (dto.jobPostLimit !== undefined)
            payment.jobPostLimit = dto.jobPostLimit;
        if (dto.expiresAt !== undefined) {
            payment.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
        }
        return this.paymentRepository.save(payment);
    }
    async deletePaymentAdmin(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        await this.paymentRepository.remove(payment);
    }
    async getPaymentStats(startDate, endDate) {
        const query = this.paymentRepository.createQueryBuilder('payment');
        if (startDate) {
            query.andWhere('payment.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        }
        if (endDate) {
            query.andWhere('payment.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }
        const payments = await query.getMany();
        const byStatus = {};
        const byMethod = {};
        let totalAmount = 0;
        for (const payment of payments) {
            byStatus[payment.status] = (byStatus[payment.status] || 0) + 1;
            byMethod[payment.paymentMethod || 'unknown'] =
                (byMethod[payment.paymentMethod || 'unknown'] || 0) + 1;
            totalAmount += Number(payment.amount);
        }
        return {
            totalTransactions: payments.length,
            totalAmount,
            byStatus,
            byMethod,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map