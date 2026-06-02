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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
const email_service_1 = require("../services/email.service");
let ResendVerificationUseCase = class ResendVerificationUseCase {
    userRepo;
    emailService;
    constructor(userRepo, emailService) {
        this.userRepo = userRepo;
        this.emailService = emailService;
    }
    async execute(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email is required');
        }
        const { data: user } = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            return { message: 'Email already verified' };
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await this.userRepo.updateEmailVerification(user.id, tokenHash, expiresAt);
        await this.emailService.sendVerificationEmail(user.email, token);
        return { message: 'Verification email sent' };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.ResendVerificationUseCase = ResendVerificationUseCase;
exports.ResendVerificationUseCase = ResendVerificationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        email_service_1.EmailService])
], ResendVerificationUseCase);
//# sourceMappingURL=resend-verification.usecase.js.map