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
exports.VerifyEmailUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
const token_service_1 = require("../services/token.service");
let VerifyEmailUseCase = class VerifyEmailUseCase {
    userRepo;
    tokenService;
    constructor(userRepo, tokenService) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
    }
    async execute(token) {
        if (!token) {
            throw new common_1.BadRequestException('Verification token is missing');
        }
        const tokenHash = this.hashToken(token);
        const user = await this.userRepo.findByEmailVerificationTokenHash(tokenHash);
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired verification token');
        }
        if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        await this.userRepo.markEmailVerified(user.id);
        const tokens = this.tokenService.generateTokens(user);
        return {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.name,
            },
            message: 'Email verified successfully'
        };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.VerifyEmailUseCase = VerifyEmailUseCase;
exports.VerifyEmailUseCase = VerifyEmailUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        token_service_1.TokenService])
], VerifyEmailUseCase);
//# sourceMappingURL=verify-email.usecase.js.map