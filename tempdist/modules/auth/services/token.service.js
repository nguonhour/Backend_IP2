"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let TokenService = class TokenService {
    generateTokens(user) {
        const role = user.role?.name.toUpperCase();
        if (!role) {
            throw new Error('User role is required to generate tokens');
        }
        const accessToken = this.sign({ sub: user.id, email: user.email, role }, 60 * 60);
        const refreshToken = this.sign({ sub: user.id, email: user.email, role, type: 'refresh' }, 60 * 60 * 24 * 7);
        return { accessToken, refreshToken };
    }
    sign(payload, expiresInSeconds) {
        const now = Math.floor(Date.now() / 1000);
        const body = {
            ...payload,
            iat: now,
            exp: now + expiresInSeconds,
        };
        const secret = process.env.JWT_SECRET || 'dev-only-secret';
        const encodedPayload = Buffer.from(JSON.stringify(body)).toString('base64url');
        const signature = (0, crypto_1.createHmac)('sha256', secret)
            .update(encodedPayload)
            .digest('base64url');
        return `${encodedPayload}.${signature}`;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)()
], TokenService);
//# sourceMappingURL=token.service.js.map