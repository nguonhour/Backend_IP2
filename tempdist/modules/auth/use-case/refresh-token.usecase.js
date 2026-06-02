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
exports.RefreshTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../repositories/user.repository");
const token_service_1 = require("../services/token.service");
let RefreshTokenUseCase = class RefreshTokenUseCase {
    userRepo;
    tokenService;
    constructor(userRepo, tokenService) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
    }
    async execute(refreshToken, res) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not provided');
        }
        const tokenHash = this.hashToken(refreshToken);
        const user = await this.userRepo.findByRefreshTokenHash(tokenHash);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const tokens = this.tokenService.generateTokens(user);
        await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.name,
            },
        };
    }
    hashToken(token) {
        return Buffer.from(token).toString('base64url');
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        token_service_1.TokenService])
], RefreshTokenUseCase);
//# sourceMappingURL=refresh-token.usecase.js.map