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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../../../entities/master/role.entity");
const user_entity_1 = require("../../users/user.entity");
let UserRepository = class UserRepository {
    userRepository;
    roleRepository;
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async findByEmail(email) {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: ['role'],
        });
        return { data: user };
    }
    async create(input) {
        const role = await this.roleRepository.findOne({
            where: { name: input.role.toUpperCase(), isActive: true },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        const user = this.userRepository.create({
            email: input.email.toLowerCase(),
            passwordHash: input.password,
            isVerified: input.is_verified,
            authProvider: 'LOCAL',
            role,
        });
        const saved = await this.userRepository.save(user);
        return { data: saved };
    }
    async createOAuthUser(input) {
        const role = await this.roleRepository.findOne({
            where: { name: input.role.toUpperCase(), isActive: true },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        const user = this.userRepository.create({
            email: input.email.toLowerCase(),
            passwordHash: '',
            isVerified: input.is_verified,
            authProvider: input.authProvider,
            role,
        });
        const saved = await this.userRepository.save(user);
        return { data: saved };
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.userRepository.update({ id: userId }, { refreshTokenHash: this.hashToken(refreshToken) });
    }
    async updatePasswordHash(userId, passwordHash) {
        await this.userRepository.update({ id: userId }, { passwordHash });
    }
    async updateEmailVerification(userId, tokenHash, expiresAt) {
        await this.userRepository.update({ id: userId }, {
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: expiresAt,
        });
    }
    async updateResetToken(userId, tokenHash, expiresAt) {
        await this.userRepository.update({ id: userId }, { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt });
    }
    async findByResetTokenHash(tokenHash) {
        return this.userRepository.findOne({
            where: { resetTokenHash: tokenHash },
            relations: ['role'],
        });
    }
    async clearResetToken(userId) {
        await this.userRepository.update({ id: userId }, { resetTokenHash: null, resetTokenExpiresAt: null });
    }
    async findByEmailVerificationTokenHash(tokenHash) {
        return this.userRepository.findOne({
            where: { emailVerificationTokenHash: tokenHash },
            relations: ['role'],
        });
    }
    async markEmailVerified(userId) {
        await this.userRepository.update({ id: userId }, {
            isVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
        });
    }
    async findByRefreshTokenHash(tokenHash) {
        const user = await this.userRepository.findOne({
            where: { refreshTokenHash: tokenHash },
            relations: ['role'],
        });
        return user;
    }
    hashToken(token) {
        return Buffer.from(token).toString('base64url');
    }
    async findByIdWithRole(id) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserRepository);
//# sourceMappingURL=user.repository.js.map