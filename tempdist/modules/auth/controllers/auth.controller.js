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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const login_dto_1 = require("../dto/login.dto");
const signup_usecase_1 = require("../use-case/signup.usecase");
const login_usecase_1 = require("../use-case/login.usecase");
const refresh_token_usecase_1 = require("../use-case/refresh-token.usecase");
const forgot_password_usecase_1 = require("../use-case/forgot-password.usecase");
const reset_password_usecase_1 = require("../use-case/reset-password.usecase");
const google_dto_1 = require("../dto/google.dto");
const google_usecase_1 = require("../use-case/google.usecase");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const getMe_usecase_1 = require("../use-case/getMe_usecase");
const verify_email_usecase_1 = require("../use-case/verify-email.usecase");
const resend_verification_usecase_1 = require("../use-case/resend-verification.usecase");
const resend_verification_dto_1 = require("../dto/resend-verification.dto");
const change_password_usecase_1 = require("../use-case/change-password.usecase");
const change_password_dto_1 = require("../dto/change-password.dto");
let AuthController = class AuthController {
    signupUseCase;
    loginUseCase;
    refreshTokenUseCase;
    forgotPasswordUseCase;
    resetPasswordUseCase;
    googleUseCase;
    getMeUseCase;
    verifyEmailUseCase;
    resendVerificationUseCase;
    changePasswordUseCase;
    constructor(signupUseCase, loginUseCase, refreshTokenUseCase, forgotPasswordUseCase, resetPasswordUseCase, googleUseCase, getMeUseCase, verifyEmailUseCase, resendVerificationUseCase, changePasswordUseCase) {
        this.signupUseCase = signupUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.googleUseCase = googleUseCase;
        this.getMeUseCase = getMeUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationUseCase = resendVerificationUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
    }
    getMe(req) {
        return this.getMeUseCase.execute(req.user.id);
    }
    signup(dto, res) {
        const additionalData = 'companyName' in dto
            ? this.buildEmployerSignupData(dto)
            : this.buildStudentSignupData(dto);
        return this.signupUseCase.execute(dto.email, dto.password, dto.role, res, additionalData);
    }
    buildStudentSignupData(dto) {
        return {
            name: dto.name,
            avatarUrl: dto.avatarUrl,
            cvUrl: dto.cvUrl,
        };
    }
    buildEmployerSignupData(dto) {
        return {
            name: dto.name,
            companyName: dto.companyName,
            position: dto.position,
            companyWebsite: dto.companyWebsite,
        };
    }
    login(dto, res) {
        return this.loginUseCase.execute(dto.email, dto.password, res);
    }
    verifyEmail(token) {
        return this.verifyEmailUseCase.execute(token);
    }
    resendVerification(dto) {
        return this.resendVerificationUseCase.execute(dto.email);
    }
    refresh(req, res) {
        const cookies = req.cookies ?? undefined;
        const refreshToken = cookies?.refresh_token;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is missing');
        }
        return this.refreshTokenUseCase.execute(refreshToken, res);
    }
    async forgotPassword(body) {
        await this.forgotPasswordUseCase.execute(body.email);
        return { message: 'If an account exists, a reset email has been sent' };
    }
    async resetPassword(body) {
        await this.resetPasswordUseCase.execute(body.email, body.token, body.newPassword);
        return { message: 'Password reset successful' };
    }
    changePassword(req, dto) {
        return this.changePasswordUseCase.execute(req.user.id, dto.oldPassword, dto.newPassword);
    }
    logout(res) {
        const isProd = process.env.NODE_ENV === 'production';
        res.clearCookie('refresh_token', {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
        });
        return { message: 'Logged out successfully' };
    }
    google(dto, res) {
        return this.googleUseCase.execute(dto.access_token, dto.role, res);
    }
    debugCookies(req) {
        return {
            cookies: req.cookies ?? {},
            headers: req.headers,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_dto_1.GoogleAuthDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "google", null);
__decorate([
    (0, common_1.Get)('debug-cookies'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "debugCookies", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [signup_usecase_1.SignupUseCase,
        login_usecase_1.LoginUseCase,
        refresh_token_usecase_1.RefreshTokenUseCase,
        forgot_password_usecase_1.ForgotPasswordUseCase,
        reset_password_usecase_1.ResetPasswordUseCase,
        google_usecase_1.GoogleUseCase,
        getMe_usecase_1.GetMeUseCase,
        verify_email_usecase_1.VerifyEmailUseCase,
        resend_verification_usecase_1.ResendVerificationUseCase,
        change_password_usecase_1.ChangePasswordUseCase])
], AuthController);
//# sourceMappingURL=auth.controller.js.map