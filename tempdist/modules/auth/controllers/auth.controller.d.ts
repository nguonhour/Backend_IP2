import type { Response, Request } from 'express';
import { RegisterEmployerDto } from '../dto/register-employer.dto';
import { RegisterStudentDto } from '../dto/register-student.dto';
import { LoginDto } from '../dto/login.dto';
import { SignupUseCase } from '../use-case/signup.usecase';
import { LoginUseCase } from '../use-case/login.usecase';
import { RefreshTokenUseCase } from '../use-case/refresh-token.usecase';
import { ForgotPasswordUseCase } from '../use-case/forgot-password.usecase';
import { ResetPasswordUseCase } from '../use-case/reset-password.usecase';
import { GoogleAuthDto } from '../dto/google.dto';
import { GoogleUseCase } from '../use-case/google.usecase';
import type { AuthenticatedRequest } from '../../../common/types/auth-request.type';
import { GetMeUseCase } from '../use-case/getMe_usecase';
import { VerifyEmailUseCase } from '../use-case/verify-email.usecase';
import { ResendVerificationUseCase } from '../use-case/resend-verification.usecase';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { ChangePasswordUseCase } from '../use-case/change-password.usecase';
import { ChangePasswordDto } from '../dto/change-password.dto';
type AuthUserResponse = {
    id: string;
    email: string;
    role: string;
};
type AuthResponse = {
    accessToken?: string;
    user: AuthUserResponse;
    message?: string;
};
export declare class AuthController {
    private readonly signupUseCase;
    private readonly loginUseCase;
    private readonly refreshTokenUseCase;
    private readonly forgotPasswordUseCase;
    private readonly resetPasswordUseCase;
    private readonly googleUseCase;
    private readonly getMeUseCase;
    private readonly verifyEmailUseCase;
    private readonly resendVerificationUseCase;
    private readonly changePasswordUseCase;
    constructor(signupUseCase: SignupUseCase, loginUseCase: LoginUseCase, refreshTokenUseCase: RefreshTokenUseCase, forgotPasswordUseCase: ForgotPasswordUseCase, resetPasswordUseCase: ResetPasswordUseCase, googleUseCase: GoogleUseCase, getMeUseCase: GetMeUseCase, verifyEmailUseCase: VerifyEmailUseCase, resendVerificationUseCase: ResendVerificationUseCase, changePasswordUseCase: ChangePasswordUseCase);
    getMe(req: AuthenticatedRequest): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
    signup(dto: RegisterStudentDto | RegisterEmployerDto, res: Response): Promise<AuthResponse>;
    private buildStudentSignupData;
    private buildEmployerSignupData;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    verifyEmail(token: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        email: string;
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    changePassword(req: AuthenticatedRequest, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    logout(res: Response): {
        message: string;
    };
    google(dto: GoogleAuthDto, res: Response): Promise<{
        isExistingUser: boolean;
        email: string;
        isNewUser?: undefined;
        accessToken?: undefined;
        user?: undefined;
    } | {
        isNewUser: boolean;
        email: string;
        isExistingUser?: undefined;
        accessToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            name: string;
            avatarUrl: string | null;
        };
        isNewUser: boolean;
        isExistingUser?: undefined;
        email?: undefined;
    }>;
    debugCookies(req: Request): {
        cookies: Record<string, any>;
        headers: import("http").IncomingHttpHeaders;
    };
}
export {};
