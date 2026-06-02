"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./controllers/auth.controller");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/user.entity");
const role_entity_1 = require("../../entities/master/role.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const signup_usecase_1 = require("./use-case/signup.usecase");
const login_usecase_1 = require("./use-case/login.usecase");
const google_usecase_1 = require("./use-case/google.usecase");
const refresh_token_usecase_1 = require("./use-case/refresh-token.usecase");
const forgot_password_usecase_1 = require("./use-case/forgot-password.usecase");
const reset_password_usecase_1 = require("./use-case/reset-password.usecase");
const change_password_usecase_1 = require("./use-case/change-password.usecase");
const user_repository_1 = require("./repositories/user.repository");
const token_service_1 = require("./services/token.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("./guards/optional-jwt-auth.guard");
const getMe_usecase_1 = require("./use-case/getMe_usecase");
const email_service_1 = require("./services/email.service");
const verify_email_usecase_1 = require("./use-case/verify-email.usecase");
const resend_verification_usecase_1 = require("./use-case/resend-verification.usecase");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                student_profile_entity_1.StudentProfile,
                employer_profile_entity_1.EmployerProfile,
                resume_entity_1.Resume,
            ]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            user_repository_1.UserRepository,
            token_service_1.TokenService,
            signup_usecase_1.SignupUseCase,
            login_usecase_1.LoginUseCase,
            google_usecase_1.GoogleUseCase,
            refresh_token_usecase_1.RefreshTokenUseCase,
            forgot_password_usecase_1.ForgotPasswordUseCase,
            reset_password_usecase_1.ResetPasswordUseCase,
            change_password_usecase_1.ChangePasswordUseCase,
            jwt_auth_guard_1.JwtAuthGuard,
            optional_jwt_auth_guard_1.OptionalJwtAuthGuard,
            getMe_usecase_1.GetMeUseCase,
            email_service_1.EmailService,
            verify_email_usecase_1.VerifyEmailUseCase,
            resend_verification_usecase_1.ResendVerificationUseCase,
        ],
        exports: [jwt_auth_guard_1.JwtAuthGuard, optional_jwt_auth_guard_1.OptionalJwtAuthGuard, auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map