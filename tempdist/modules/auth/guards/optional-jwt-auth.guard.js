"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let OptionalJwtAuthGuard = class OptionalJwtAuthGuard {
    secret = process.env.JWT_SECRET || 'dev-only-secret';
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return true;
        }
        const token = authHeader.split(' ')[1];
        const payload = this.verifyToken(token);
        if (payload) {
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };
        }
        return true;
    }
    verifyToken(token) {
        if (!token)
            return null;
        const parts = token.split('.');
        if (parts.length !== 2)
            return null;
        const [encodedPayload, signature] = parts;
        const expectedSignature = (0, crypto_1.createHmac)('sha256', this.secret)
            .update(encodedPayload)
            .digest('base64url');
        if (signature !== expectedSignature)
            return null;
        try {
            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
            if (payload.exp < Math.floor(Date.now() / 1000))
                return null;
            return payload;
        }
        catch {
            return null;
        }
    }
};
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard;
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], OptionalJwtAuthGuard);
//# sourceMappingURL=optional-jwt-auth.guard.js.map