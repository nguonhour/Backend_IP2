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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let JwtAuthGuard = class JwtAuthGuard {
    secret;
    constructor() {
        this.secret = process.env.JWT_SECRET || 'dev-only-secret';
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header. Expected: Bearer <token>');
        }
        const token = authHeader.split(' ')[1];
        const payload = this.verifyToken(token);
        request.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        return Promise.resolve(true);
    }
    verifyToken(token) {
        const secret = this.secret;
        const parts = token.split('.');
        if (parts.length !== 2) {
            throw new common_1.UnauthorizedException('Invalid token format');
        }
        const [encodedPayload, signature] = parts;
        const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
            .update(encodedPayload)
            .digest('base64url');
        if (signature !== expectedSignature) {
            throw new common_1.UnauthorizedException('Invalid token signature');
        }
        let payload;
        try {
            payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            throw new common_1.UnauthorizedException('Token has expired');
        }
        return payload;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map