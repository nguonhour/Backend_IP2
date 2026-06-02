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
exports.ChangePasswordUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
let ChangePasswordUseCase = class ChangePasswordUseCase {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(userId, oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        if (oldPassword === newPassword) {
            throw new common_1.BadRequestException('New password must be different from old password');
        }
        const user = await this.userRepo.findByIdWithRole(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.authProvider !== 'LOCAL' || !user.passwordHash) {
            throw new common_1.BadRequestException('Password changes are only available for email/password accounts');
        }
        const oldPasswordHash = this.hashPassword(oldPassword);
        const legacyPlainTextMatch = user.passwordHash === oldPassword;
        if (user.passwordHash !== oldPasswordHash && !legacyPlainTextMatch) {
            throw new common_1.UnauthorizedException('Old password is incorrect');
        }
        const newPasswordHash = this.hashPassword(newPassword);
        await this.userRepo.updatePasswordHash(user.id, newPasswordHash);
        return { message: 'Password changed successfully' };
    }
    hashPassword(password) {
        return (0, crypto_1.createHash)('sha256').update(password).digest('hex');
    }
};
exports.ChangePasswordUseCase = ChangePasswordUseCase;
exports.ChangePasswordUseCase = ChangePasswordUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], ChangePasswordUseCase);
//# sourceMappingURL=change-password.usecase.js.map