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
exports.ForgotPasswordUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
const email_service_1 = require("../services/email.service");
let ForgotPasswordUseCase = class ForgotPasswordUseCase {
    userRepo;
    emailService;
    constructor(userRepo, emailService) {
        this.userRepo = userRepo;
        this.emailService = emailService;
    }
    async execute(email) {
        if (!email)
            throw new common_1.BadRequestException('Email is required');
        const { data: user } = await this.userRepo.findByEmail(email);
        if (!user) {
            return;
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepo.updateResetToken(user.id, tokenHash, expiresAt);
        await this.emailService.sendResetPasswordEmail(user.email, token);
    }
};
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
exports.ForgotPasswordUseCase = ForgotPasswordUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        email_service_1.EmailService])
], ForgotPasswordUseCase);
//# sourceMappingURL=forgot-password.usecase.js.map