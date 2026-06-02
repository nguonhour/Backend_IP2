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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mail_1 = __importDefault(require("@sendgrid/mail"));
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    isEnabled;
    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        const from = process.env.SENDGRID_FROM;
        this.isEnabled = Boolean(apiKey && from);
        if (!apiKey || !from) {
            this.logger.warn('SendGrid is not configured. Email verification will be skipped in this environment.');
            return;
        }
        mail_1.default.setApiKey(apiKey);
    }
    async sendVerificationEmail(email, token) {
        const appBaseUrl = process.env.APP_BASE_URL ??
            process.env.FRONTEND_URL ??
            'http://localhost:5174';
        if (!this.isEnabled) {
            return;
        }
        const from = process.env.SENDGRID_FROM;
        if (!from) {
            throw new common_1.InternalServerErrorException('SENDGRID_FROM is not set');
        }
        if (!this.isEnabled) {
            this.logger.log(`Email sending is disabled. Would have sent verification email to ${email} with token ${token}`);
            return;
        }
        const verifyUrl = `${appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;
        try {
            await mail_1.default.send({
                to: email,
                from,
                subject: 'Verify your email',
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Verify your email</h2>
            <p>Click the button below to verify your email address.</p>
            <p>
              <a href="${verifyUrl}" style="background:#1E51BE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
                Verify Email
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p>${verifyUrl}</p>
          </div>
        `,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.logger.error(`Failed to send verification email: ${errorMessage}`);
            throw new common_1.InternalServerErrorException('Failed to send verification email');
        }
    }
    async sendResetPasswordEmail(email, token) {
        if (!this.isEnabled) {
            return;
        }
        const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5174';
        const from = process.env.SENDGRID_FROM;
        if (!from) {
            throw new common_1.InternalServerErrorException('SENDGRID_FROM is not set');
        }
        const resetUrl = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
        try {
            await mail_1.default.send({
                to: email,
                from,
                subject: 'Reset your password',
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Reset your password</h2>
            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
            <p>
              <a href="${resetUrl}" style="background:#1E51BE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
                Reset Password
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p>${resetUrl}</p>
          </div>
        `,
            });
        }
        catch {
            throw new common_1.InternalServerErrorException('Failed to send reset password email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map