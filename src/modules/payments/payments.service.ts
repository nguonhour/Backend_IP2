import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PayWayAPIError, PayWay } from 'aba-payway';
import type {
  GenerateQROptions,
  GenerateQRResponse,
  ItemEntry,
  PaymentOption,
  QRPaymentOption,
} from 'aba-payway';
import * as crypto from 'crypto';
import { logErrorToFile } from '../../common/logger/file-logger';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from './enum/payment-status.enum';
import { AbaPushbackPayload } from './interfaces/aba-pushback-payload.interface';

/**
 * Verify pushback signature using timing-safe comparison.
 * Protects against timing attacks by using crypto.timingSafeEqual.
 * base is constructed as `${reqTime}${merchantId}${tranId}${amount}`
 */
export function verifyPushbackSignature(
  payload: AbaPushbackPayload,
  providedHash: string,
  apiKey: string,
): boolean {
  const reqTime = String(payload.req_time ?? payload.reqTime ?? '');
  const merchantId = String(payload.merchant_id ?? payload.merchantId ?? '');
  const tranId = String(
    payload.tran_id ?? payload.tranId ?? payload.transactionId ?? '',
  );
  const amount = String(payload.amount ?? '');

  const base = `${reqTime}${merchantId}${tranId}${amount}`;
  const hmacHex = crypto
    .createHmac('sha256', apiKey)
    .update(base)
    .digest('hex');

  // Convert to Buffer for timing-safe comparison
  const expectBuf = Buffer.from(hmacHex.toLowerCase());
  const actualBuf = Buffer.from(String(providedHash ?? '').toLowerCase());

  // Return false immediately if lengths don't match (safe operation)
  if (expectBuf.length !== actualBuf.length) return false;

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(expectBuf, actualBuf);
}

/**
 * Verify raw webhook body signature for providers that sign the raw payload.
 * Tries HMAC-SHA256 in hex and base64 forms.
 */
export function verifyRawBodySignature(
  rawBody: string,
  providedSignature: string,
  apiKey: string,
): boolean {
  const raw = String(rawBody ?? '');
  const sig = String(providedSignature ?? '').trim();
  if (!raw || !sig) return false;

  const cleanSig = sig.replace(/^sha256=/i, '').toLowerCase();
  const hmacHex = crypto.createHmac('sha256', apiKey).update(raw).digest('hex');
  const hmacBase64 = crypto
    .createHmac('sha256', apiKey)
    .update(raw)
    .digest('base64')
    .toLowerCase();

  return cleanSig === hmacHex.toLowerCase() || cleanSig === hmacBase64;
}

@Injectable()
export class PaymentsService {
  private payway: PayWay;
  private readonly logger = new Logger(PaymentsService.name);
  private readonly sandboxTransactionOverrides = new Map<
    string,
    PaymentStatus
  >();

  private formatAmount(
    amount: number,
    currency: 'USD' | 'KHR' = 'KHR',
  ): number {
    if (Number.isNaN(Number(amount)))
      throw new BadRequestException('Invalid amount');

    if (currency === 'KHR') {
      // KHR: provider expects integer riels
      return Math.round(amount);
    }

    // USD: keep the original dollar amount; the SDK formats it to 2 decimals
    return Math.round(amount * 100) / 100;
  }

  private formatPaywayAmount(
    amount: number,
    currency: 'USD' | 'KHR' = 'USD',
  ): string {
    if (currency === 'KHR') {
      return Math.round(amount).toString();
    }

    return amount.toFixed(2);
  }

  private toBase64(value: string): string {
    return Buffer.from(value).toString('base64');
  }

  /**
   * Create ABA PayWay hash with specified algorithm and encoding.
   * - SHA512 + base64: For hosted checkout (SDK handles internally)
   * - SHA256 + hex: For QR code generation API
   */
  private createPaywayHash(
    values: string[],
    algorithm: 'sha256' | 'sha512' = 'sha512',
    encoding: 'base64' | 'hex' = 'base64',
  ): string {
    const apiKey = this.config.get<string>('ABA_API_KEY') ?? '';
    return crypto
      .createHmac(algorithm, apiKey)
      .update(values.join(''))
      .digest(encoding);
  }

  private getPaywayBaseUrl() {
    const configured = this.config.get<string>('ABA_BASE_URL') ?? '';
    if (configured.trim()) return configured.trim().replace(/\/+$/, '');

    return this.config.get('NODE_ENV') === 'production'
      ? 'https://checkout.payway.com.kh'
      : 'https://checkout-sandbox.payway.com.kh';
  }

  private isSandboxMode() {
    return (
      this.config.get('NODE_ENV') !== 'production' &&
      this.getPaywayBaseUrl().includes('sandbox')
    );
  }

  private getPaywayResponseMessage(error: PayWayAPIError): string {
    const responseBody = error.responseBody as
      | { status?: { message?: unknown } }
      | undefined;
    const message = responseBody?.status?.message;

    return typeof message === 'string' && message.trim()
      ? message
      : error.message;
  }

  private filterPaywayParams(params: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => {
        return value !== undefined && value !== null && value !== '';
      }),
    );
  }

  private async generatePaywayQR(
    options: GenerateQROptions,
  ): Promise<GenerateQRResponse> {
    const reqTime = this.formatPaywayRequestTime();
    const currency = options.currency ?? 'USD';
    const amountStr = options.amount.toString(); // string representation for hash
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

    // QR verification requires SHA-256 with HEX encoding (not SHA-512 base64)
    const hash = this.createPaywayHash(
      [
        reqTime,
        this.config.get<string>('ABA_MERCHANT_ID') ?? '',
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
      ],
      'sha256',
      'hex',
    ); // Explicit SHA256 + HEX for QR API

    const response = await fetch(
      `${this.getPaywayBaseUrl()}/api/payment-gateway/v1/payments/generate-qr`,
      {
        method: 'POST',
        body: JSON.stringify(
          this.filterPaywayParams({
            hash,
            req_time: reqTime,
            merchant_id: this.config.get<string>('ABA_MERCHANT_ID') ?? '',
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
          }),
        ),
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      let responseBody: unknown = text;
      try {
        responseBody = JSON.parse(text);
      } catch {
        // Keep the raw response text when ABA returns non-JSON errors.
      }
      throw new PayWayAPIError(
        `PayWay API error: ${response.status} ${response.statusText}`,
        response.status,
        responseBody,
      );
    }

    return (await response.json()) as GenerateQRResponse;
  }

  private formatPaywayRequestTime(date = new Date()): string {
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private isQrPaymentOption(
    paymentOption?: PaymentOption,
  ): paymentOption is QRPaymentOption {
    return (
      paymentOption === 'abapay_khqr' ||
      paymentOption === 'abapay_khqr_deeplink'
    );
  }

  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(EmployerProfile)
    private employerRepository: Repository<EmployerProfile>,
    private readonly config: ConfigService,
  ) {
    this.validateEnv();
    this.payway = new PayWay({
      merchantId: this.config.get<string>('ABA_MERCHANT_ID') ?? '',
      apiKey: this.config.get<string>('ABA_API_KEY') ?? '',
      environment:
        this.config.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
    });
  }

  /**
   * Update payment by transactionRef (transaction id returned by ABA)
   */
  async updateStatusByTransactionRef(
    transactionRef: string,
    status: PaymentStatus,
  ): Promise<Payment | null> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionRef },
    });

    if (!payment) return null;
    if (String(payment.status) === 'PAID' && String(status) === 'PAID') {
      return payment;
    }
    payment.status = status;
    return this.paymentRepository.save(payment);
  }

  /**
   * Handle pushback (webhook) from ABA PayWay.
   * Verifies signature/hash using ABA API key and updates payment status in DB.
   */
  async handlePushback(
    payload: AbaPushbackPayload,
    signatureHeader?: string,
    rawBody?: string,
  ): Promise<{ ok: boolean; payment?: Payment | null; reason?: string }> {
    try {
      const apiKey = this.config.get<string>('ABA_API_KEY') ?? '';

      // Extract transactionRef and provided hash
      const tranId = String(
        payload.tran_id ?? payload.tranId ?? payload.transactionId ?? '',
      );
      const providedHash = String(
        signatureHeader ??
          payload.hash ??
          payload.signature ??
          payload.hmac ??
          '',
      );

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
        this.logger.warn(
          'Pushback signature verification failed',
          providedHash,
        );
        try {
          logErrorToFile(new Error('Invalid pushback signature'), {
            service: 'PaymentsService',
            method: 'handlePushback',
            payload: JSON.stringify(payload),
          });
        } catch {
          // ignore logging failure
        }
        return { ok: false, reason: 'invalid_signature' };
      }

      // Determine payment status from ABA response
      // ABA's standard success indicator is status code '0' or '00'
      const rawCode = String(
        payload.status ?? payload.status_code ?? payload.code ?? '',
      ).trim();

      // Map to our internal status - explicit check for success
      let newStatus = PaymentStatus.PENDING;

      // ABA success codes: '0', '00', or uppercase 'SUCCESS'/'APPROVED'
      if (
        rawCode === '0' ||
        rawCode === '00' ||
        rawCode.toUpperCase() === 'SUCCESS' ||
        rawCode.toUpperCase() === 'APPROVED'
      ) {
        newStatus = PaymentStatus.PAID;
      } else if (
        rawCode.toUpperCase() === 'FAILED' ||
        rawCode.toUpperCase() === 'DECLINED' ||
        rawCode.toUpperCase() === 'CANCELLED'
      ) {
        newStatus = PaymentStatus.FAILED;
      }

      // Update payment by transactionRef (tranId)
      const updated = await this.updateStatusByTransactionRef(
        tranId,
        newStatus,
      );

      return { ok: true, payment: updated ?? null };
    } catch (err) {
      this.logger.error('Error handling pushback', err as Error);
      try {
        logErrorToFile(err, {
          service: 'PaymentsService',
          method: 'handlePushback',
        });
      } catch {
        // ignore
      }
      return { ok: false, reason: 'exception' };
    }
  }

  private validateEnv() {
    const missing: string[] = [];
    const merchantId = this.config.get<string>('ABA_MERCHANT_ID');
    const apiKey = this.config.get<string>('ABA_API_KEY');

    if (!merchantId) missing.push('ABA_MERCHANT_ID');
    if (!apiKey) missing.push('ABA_API_KEY');
    if (missing.length) {
      const msg = `Missing required ABA Payway env: ${missing.join(', ')}`;
      this.logger.error(msg);
      try {
        logErrorToFile(new Error(msg), {
          service: 'PaymentsService',
          context: 'validateEnv',
        });
      } catch (error) {
        console.error('Failed to log missing env error:', error);
      }
      throw new Error(msg);
    }

    if (apiKey?.startsWith('http://') || apiKey?.startsWith('https://')) {
      const msg =
        'Invalid ABA_API_KEY: expected secret key from ABA merchant portal, but received a URL';
      this.logger.error(msg);
      throw new Error(msg);
    }
  }

  private async getEmployer(userId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');
    return employer;
  }

  private async getOptionalEmployer(userId?: string) {
    if (!userId) return null;

    return this.employerRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  private async createPendingCheckoutPayment(
    userId: string | undefined,
    opts: {
      transactionId: string;
      amount: number;
      currency: string;
      paymentMethod?: string;
      planName?: string;
      expiresAt?: Date;
    },
  ) {
    const employer = await this.getOptionalEmployer(userId);
    const existing = await this.paymentRepository.findOne({
      where: { transactionRef: opts.transactionId },
      relations: ['employer'],
    });

    if (existing) {
      let changed = false;
      if (employer && !existing.employer) {
        existing.employer = { id: employer.id } as EmployerProfile;
        changed = true;
      }
      if (opts.planName && !existing.planName) {
        existing.planName = opts.planName;
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
      status: PaymentStatus.PENDING,
      paymentMethod: opts.paymentMethod,
      transactionRef: opts.transactionId,
      planName: opts.planName,
      expiresAt: opts.expiresAt ?? null,
    });

    return this.paymentRepository.save(payment);
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const employer = await this.getEmployer(userId);

    const payment = this.paymentRepository.create({
      employer: { id: employer.id },
      amount: dto.amount,
      currency: dto.currency,
      status: dto.status ?? PaymentStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      transactionRef: dto.transactionRef,
      planName: dto.planName,
    });

    return this.paymentRepository.save(payment);
  }

  async getMyPayments(userId: string) {
    const employer = await this.getEmployer(userId);
    const includeLegacyUnowned =
      this.config.get<string>('NODE_ENV') !== 'production' ||
      this.config.get<string>('PAYMENTS_INCLUDE_LEGACY_UNOWNED') === 'true';

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.employer', 'employer')
      .where('employer.id = :employerId', { employerId: employer.id });

    if (includeLegacyUnowned) {
      query.orWhere('payment.employer_id IS NULL');
    }

    return query.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async updateStatus(userId: string, paymentId: string, dto: UpdatePaymentDto) {
    const employer = await this.getEmployer(userId);
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, employer: { id: employer.id } },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = dto.status;
    return this.paymentRepository.save(payment);
  }

  async deletePayment(userId: string, paymentId: string) {
    const employer = await this.getEmployer(userId);
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, employer: { id: employer.id } },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    await this.paymentRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }

  private generateTransactionId() {
    return crypto.randomBytes(10).toString('hex');
  }

  private getFrontendBaseUrl() {
    const configured = this.config.get<string>('FRONTEND_URL') ?? '';
    const fallback = 'http://localhost:5173';
    const base = configured.trim() || fallback;
    return base.replace(/\/+$/, '');
  }

  private getBackendBaseUrl() {
    const configured = this.config.get<string>('BACKEND_URL') ?? '';
    const fallback = 'http://localhost:3211';
    const base = configured.trim() || fallback;
    return base.replace(/\/+$/, '');
  }

  /**
   * Create checkout parameters for ABA Payway payment.
   * This generates form parameters to submit via ABA's frontend SDK.
   * Returns: { transactionId, checkoutParams }
   *
   * Usage on frontend: Send checkoutParams to ABA's hidden form and call AbaPayway.checkout()
   */
  async createCheckout(
    userId: string | undefined,
    amount: number,
    opts?: {
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
    },
  ) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    // Ensure transactionId is alphanumeric and <= 20 chars
    const rawTran = String(opts?.transactionId ?? this.generateTransactionId());
    const transactionId = rawTran.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);

    if (!transactionId || transactionId.length === 0) {
      throw new BadRequestException('Invalid transaction ID');
    }

    try {
      const frontendBaseUrl = this.getFrontendBaseUrl();
      const currency = opts?.currency ?? 'KHR';
      const amountValue = this.formatAmount(amount, currency);
      const paymentOption = opts?.paymentOption;
      const planName =
        opts?.planName ??
        String(opts?.items ?? 'Employer subscription').replace(
          /\s+subscription$/i,
          '',
        );
      const lifetimeMinutes = 30;
      const expiresAt = new Date(Date.now() + lifetimeMinutes * 60 * 1000);
      await this.createPendingCheckoutPayment(userId, {
        transactionId,
        amount: amountValue,
        currency,
        paymentMethod: paymentOption,
        planName,
        expiresAt,
      });

      // The aba-payway SDK base64-encodes items internally. Keep these raw here.
      const itemsArray: ItemEntry[] = [
        {
          name: opts?.items ?? 'Student Portal Payment',
          quantity: '1',
          price: (Number(amountValue) || 0).toFixed(2),
        },
      ];
      const qrItems = JSON.stringify(itemsArray);

      // Default frontend result URLs so ABA redirects users back to the Vue app
      const resultPageUrl = `${frontendBaseUrl}/payment/result?transactionId=${transactionId}`;
      const cancelPageUrl = `${frontendBaseUrl}/payment/result?transactionId=${transactionId}&status=CANCELLED`;

      if (this.isQrPaymentOption(paymentOption)) {
        const qrImageTemplate =
          this.config.get<string>('ABA_QR_IMAGE_TEMPLATE') ?? 'template1';
        const qrPayload: GenerateQROptions = {
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

        this.logger.debug(
          'Generating QR with payload',
          JSON.stringify(qrPayload),
        );

        const qrResponse = await this.generatePaywayQR(qrPayload);

        return {
          transactionId,
          mode: 'qr',
          qrResponse,
          expiresAt: expiresAt.toISOString(),
          continueUrl:
            opts?.continueSuccessUrl ??
            this.config.get<string>('ABA_CONTINUE_SUCCESS_URL') ??
            `${frontendBaseUrl}/dashboard`,
        };
      }

      // createTransaction() is SYNCHRONOUS - generates form params, no API call
      const checkoutParams = this.payway.createTransaction({
        transactionId,
        amount: amountValue,
        currency,
        items: itemsArray,
        paymentOption,
        viewType: 'hosted_view',
        shipping: this.formatAmount(opts?.shipping ?? 0, currency),
        returnUrl:
          opts?.returnUrl ??
          this.config.get<string>('ABA_RETURN_URL') ??
          resultPageUrl,
        cancelUrl:
          opts?.cancelUrl ??
          this.config.get<string>('ABA_CANCEL_URL') ??
          cancelPageUrl,
        continueSuccessUrl:
          opts?.continueSuccessUrl ??
          this.config.get<string>('ABA_CONTINUE_SUCCESS_URL') ??
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
        checkoutParams, // Send to frontend to submit to ABA's checkout form
        abaBaseUrl:
          this.config.get<string>('ABA_BASE_URL') ??
          'https://checkout-sandbox.payway.com.kh',
      };
    } catch (err) {
      this.logger.error('Failed to create ABA checkout params', err);
      try {
        logErrorToFile(err, {
          service: 'PaymentsService',
          method: 'createCheckout',
          userId,
          amount,
        });
      } catch (error) {
        console.error('Failed to log missing env error:', error);
      }

      if (err instanceof PayWayAPIError) {
        throw new BadRequestException(this.getPaywayResponseMessage(err));
      }

      throw new InternalServerErrorException(
        'Failed to create checkout parameters',
      );
    }
  }

  /**
   * Check transaction status with ABA Payway API.
   */
  async checkTransactionStatus(transactionId: string) {
    try {
      const sandboxStatus = this.sandboxTransactionOverrides.get(transactionId);
      if (sandboxStatus) {
        return {
          status: {
            code: sandboxStatus === PaymentStatus.PAID ? '00' : '01',
            message: 'Sandbox override',
            tran_id: transactionId,
          },
          data: {
            payment_status_code: sandboxStatus === PaymentStatus.PAID ? 0 : 1,
            payment_status:
              sandboxStatus === PaymentStatus.PAID ? 'APPROVED' : sandboxStatus,
            transaction_id: transactionId,
          },
        };
      }

      const result = await this.payway.checkTransaction(transactionId);
      return result;
    } catch (err) {
      this.logger.error(`Failed to check transaction ${transactionId}`, err);
      try {
        logErrorToFile(err, {
          service: 'PaymentsService',
          method: 'checkTransactionStatus',
          transactionId,
        });
      } catch (error) {
        console.error('Failed to log missing env error:', error);
      }
      if (err instanceof PayWayAPIError) {
        throw new InternalServerErrorException(err.message);
      }
      throw new InternalServerErrorException('Failed to check transaction');
    }
  }

  async markSandboxTransactionPaid(transactionId: string) {
    if (!this.isSandboxMode()) {
      throw new ForbiddenException(
        'Sandbox transaction override is only available in sandbox mode',
      );
    }

    const cleanTransactionId = String(transactionId ?? '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 20);

    if (!cleanTransactionId) {
      throw new BadRequestException('Invalid transaction ID');
    }

    this.sandboxTransactionOverrides.set(
      cleanTransactionId,
      PaymentStatus.PAID,
    );
    await this.updateStatusByTransactionRef(
      cleanTransactionId,
      PaymentStatus.PAID,
    );

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
}
