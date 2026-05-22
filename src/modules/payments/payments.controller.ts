import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Request,
  Query,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import type { AbaPushbackPayload } from './interfaces/aba-pushback-payload.interface';
import { PaymentStatus } from './enum/payment-status.enum';

type CheckoutRequest = {
  user?: {
    id: string;
  };
};

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  private getFrontendBaseUrl() {
    const configured = this.config.get<string>('FRONTEND_URL') ?? '';
    const fallback = 'http://localhost:5173';
    const base = configured.trim() || fallback;
    return base.replace(/\/+$/, '');
  }

  private getBackendBaseUrl() {
    const configured = this.config.get<string>('BACKEND_URL') ?? '';
    const fallback = `http://localhost:${this.config.get<string>('PORT') ?? '3211'}`;
    const base = configured.trim() || fallback;
    return base.replace(/\/+$/, '');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(req.user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getMyPayments(req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentsService.updateStatus(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePayment(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.deletePayment(req.user.id, id);
  }

  @Post('checkout')
  @UseGuards(OptionalJwtAuthGuard)
  createCheckout(
    @Request() req: CheckoutRequest,
    @Body() dto: CreateCheckoutDto,
  ) {
    // checkout endpoint is public; userId is optional
    const userId = req.user?.id;
    return this.paymentsService.createCheckout(userId, dto.amount, dto);
  }

  /**
   * Webhook endpoint for ABA PayWay pushback notifications.
   * Verifies signature and updates payment status in DB.
   */
  @Post('webhook')
  async handleWebhook(
    @Body() body: AbaPushbackPayload,
    @Req() req: ExpressRequest & { rawBody?: Buffer },
  ) {
    // The PaymentsService will verify signature using ABA_API_KEY
    const headerSignature =
      (req.headers['x-aba-signature'] as string | undefined) ??
      (req.headers['x-signature'] as string | undefined) ??
      (req.headers['x-payway-signature'] as string | undefined);
    const rawBody = req.rawBody?.toString('utf8');
    const result = await this.paymentsService.handlePushback(
      body,
      headerSignature,
      rawBody,
    );
    if (!result.ok) {
      throw new UnauthorizedException(
        `Webhook verification failed: ${result.reason ?? 'unknown'}`,
      );
    }
    return { status: 'success' };
  }

  /**
   * Public return endpoint used as returnUrl for ABA checkout.
   * Redirects user to configured continue URL or returns a small HTML page.
   */
  @Get('return')
  async handleReturn(
    @Query('transactionId') transactionId: string,
    @Res() res: Response,
  ) {
    const frontendBaseUrl = this.getFrontendBaseUrl();

    // Try find payment and forward to continue URL
    const continueSuccessUrl =
      this.config.get<string>('ABA_CONTINUE_SUCCESS_URL') ??
      `${frontendBaseUrl}/payment/result`;
    const continueFailureUrl =
      this.config.get<string>('ABA_CONTINUE_FAILURE_URL') ??
      `${frontendBaseUrl}/payment/result`;

    const paymentResult = await this.paymentsService
      .checkTransactionStatus(transactionId)
      .catch(() => null);

    // Prefer to redirect to configured continue URL with params
    const paymentData = (
      paymentResult as { data?: { payment_status?: unknown } } | null
    )?.data;
    const status =
      typeof paymentData?.payment_status === 'string'
        ? paymentData.payment_status
        : '';

    const normalizedStatus = status.toUpperCase();
    const successStatuses = ['APPROVED', 'PAID', 'SUCCESS'];
    const isSuccess = successStatuses.includes(normalizedStatus);
    const redirectBaseUrl = isSuccess ? continueSuccessUrl : continueFailureUrl;

    const redirectUrl = `${redirectBaseUrl}?transactionId=${encodeURIComponent(transactionId)}&status=${encodeURIComponent(status)}`;
    return res.redirect(302, redirectUrl);
  }

  @Get('transaction/:id/status')
  async checkTransactionStatus(@Param('id') transactionId: string) {
    return this.paymentsService.checkTransactionStatus(transactionId);
  }
  // http://localhost:3211/payments/transaction/545b15f75a9fdbf3da77/status

  @Post('sandbox/transactions/:id/succeed')
  markSandboxTransactionPaid(@Param('id') transactionId: string) {
    return this.paymentsService.markSandboxTransactionPaid(transactionId);
  }

  /**
   * Test webhook endpoint for sandbox - no signature verification required
   * Use this to test the webhook flow without needing the correct hash
   */
  @Post('webhook/test/:transactionId')
  async testWebhook(@Param('transactionId') transactionId: string) {
    return this.paymentsService.handlePushback(
      {
        tran_id: transactionId,
        status: '0',
      },
      'test-signature',
      JSON.stringify({ tran_id: transactionId, status: '0' }),
    );
  }
  // @Post('webhook/test/:transactionId')
  // async testWebhook(@Param('transactionId') transactionId: string) {
  //   // Skip signature verification for testing - directly mark as paid
  //   const payment =
  //     await this.paymentsService.markSandboxTransactionPaid(transactionId);

  //   return {
  //     message: 'Test webhook processed successfully',
  //     transactionId,
  //     payment,
  //     note: 'Signature verification skipped for sandbox testing',
  //   };
  // }

  /**
   * ========== ADMIN ENDPOINTS ==========
   * These endpoints require admin role
   */

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllPayments(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    // TODO: Add admin role check
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.paymentsService.getAllPayments(status, limit, offset);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // TODO: Add admin role check
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.paymentsService.getPaymentById(id);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard)
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus },
    @Req() req: AuthenticatedRequest,
  ) {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    // Use the body.status to update payment
    return this.paymentsService.updateStatusByTransactionRef(id, body.status);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async deletePaymentAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // TODO: Add admin role check
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.paymentsService.deletePaymentAdmin(id);
  }

  @Get('admin/stats/overview')
  @UseGuards(JwtAuthGuard)
  async getPaymentStats(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Add admin role check
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.paymentsService.getPaymentStats(startDate, endDate);
  }
}
