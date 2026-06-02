"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const create_checkout_dto_1 = require("./dto/create-checkout.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    config;
    constructor(paymentsService, config) {
        this.paymentsService = paymentsService;
        this.config = config;
    }
    getFrontendBaseUrl() {
        const configured = this.config.get('FRONTEND_URL') ?? '';
        const fallback = 'http://localhost:5173';
        const base = configured.trim() || fallback;
        return base.replace(/\/+$/, '');
    }
    getBackendBaseUrl() {
        const configured = this.config.get('BACKEND_URL') ?? '';
        const fallback = `http://localhost:${this.config.get('PORT') ?? '3211'}`;
        const base = configured.trim() || fallback;
        return base.replace(/\/+$/, '');
    }
    async createPayment(req, dto) {
        return this.paymentsService.createPayment(req.user.id, dto);
    }
    async getMyPayments(req) {
        return this.paymentsService.getMyPayments(req.user.id);
    }
    async updateStatus(req, id, dto) {
        return this.paymentsService.updateStatus(req.user.id, id, dto);
    }
    async deletePayment(req, id) {
        return this.paymentsService.deletePayment(req.user.id, id);
    }
    createCheckout(req, dto) {
        const userId = req.user?.id;
        return this.paymentsService.createCheckout(userId, dto.amount, dto);
    }
    async handleWebhook(body, req) {
        const headerSignature = req.headers['x-aba-signature'] ??
            req.headers['x-signature'] ??
            req.headers['x-payway-signature'];
        const rawBody = req.rawBody?.toString('utf8');
        const result = await this.paymentsService.handlePushback(body, headerSignature, rawBody);
        if (!result.ok) {
            throw new common_1.UnauthorizedException(`Webhook verification failed: ${result.reason ?? 'unknown'}`);
        }
        return { status: 'success' };
    }
    async handleReturn(transactionId, res) {
        const frontendBaseUrl = this.getFrontendBaseUrl();
        const continueSuccessUrl = this.config.get('ABA_CONTINUE_SUCCESS_URL') ??
            `${frontendBaseUrl}/payment/result`;
        const continueFailureUrl = this.config.get('ABA_CONTINUE_FAILURE_URL') ??
            `${frontendBaseUrl}/payment/result`;
        const paymentResult = await this.paymentsService
            .checkTransactionStatus(transactionId)
            .catch(() => null);
        const paymentData = paymentResult?.data;
        const status = typeof paymentData?.payment_status === 'string'
            ? paymentData.payment_status
            : '';
        const normalizedStatus = status.toUpperCase();
        const successStatuses = ['APPROVED', 'PAID', 'SUCCESS'];
        const isSuccess = successStatuses.includes(normalizedStatus);
        const redirectBaseUrl = isSuccess ? continueSuccessUrl : continueFailureUrl;
        const redirectUrl = `${redirectBaseUrl}?transactionId=${encodeURIComponent(transactionId)}&status=${encodeURIComponent(status)}`;
        return res.redirect(302, redirectUrl);
    }
    async checkTransactionStatus(transactionId) {
        return this.paymentsService.checkTransactionStatus(transactionId);
    }
    markSandboxTransactionPaid(transactionId) {
        return this.paymentsService.markSandboxTransactionPaid(transactionId);
    }
    async testWebhook(transactionId) {
        return this.paymentsService.handlePushback({
            tran_id: transactionId,
            status: '0',
        }, 'test-signature', JSON.stringify({ tran_id: transactionId, status: '0' }));
    }
    async getAllPayments(req, status, limit = 50, offset = 0) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.getAllPayments(status, limit, offset);
    }
    async createPaymentAdmin(req, dto) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.createPaymentAdmin(dto);
    }
    async getPaymentById(req, id) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.getPaymentById(id);
    }
    async updatePaymentAdmin(req, id, dto) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.updatePaymentAdmin(id, dto);
    }
    async updatePaymentStatus(id, body, req) {
        if (req.user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.updatePaymentStatusAdmin(id, body.status);
    }
    async deletePaymentAdmin(req, id) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.deletePaymentAdmin(id);
    }
    async getPaymentStats(req, startDate, endDate) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.paymentsService.getPaymentStats(startDate, endDate);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_checkout_dto_1.CreateCheckoutDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('return'),
    __param(0, (0, common_1.Query)('transactionId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleReturn", null);
__decorate([
    (0, common_1.Get)('transaction/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "checkTransactionStatus", null);
__decorate([
    (0, common_1.Post)('sandbox/transactions/:id/succeed'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "markSandboxTransactionPaid", null);
__decorate([
    (0, common_1.Post)('webhook/test/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "testWebhook", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentById", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_payment_dto_1.AdminUpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updatePaymentAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "deletePaymentAdmin", null);
__decorate([
    (0, common_1.Get)('admin/stats/overview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStats", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        config_1.ConfigService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map