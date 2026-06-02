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
exports.ResetPasswordUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(email, token, newPassword) {
        if (!email || !token || !newPassword) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const { data: user } = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired reset token');
        }
        const tokenHash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        if (!user.resetTokenHash || user.resetTokenHash !== tokenHash) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const hashedPassword = (0, crypto_1.createHash)('sha256').update(newPassword).digest('hex');
        await this.userRepo.updatePasswordHash(user.id, hashedPassword);
        await this.userRepo.clearResetToken(user.id);
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], ResetPasswordUseCase);
//# sourceMappingURL=reset-password.usecase.js.map