import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Role } from '../../entities/master/role.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { Resume } from '../resumes/resume.entity';
import { SignupUseCase } from './use-case/signup.usecase';
import { LoginUseCase } from './use-case/login.usecase';
import { GoogleUseCase } from './use-case/google.usecase';
import { RefreshTokenUseCase } from './use-case/refresh-token.usecase';
import { ForgotPasswordUseCase } from './use-case/forgot-password.usecase';
import { ResetPasswordUseCase } from './use-case/reset-password.usecase';
import { ChangePasswordUseCase } from './use-case/change-password.usecase';
import { UserRepository } from './repositories/user.repository';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { GetMeUseCase } from './use-case/getMe_usecase';
import { EmailService } from './services/email.service';
import { VerifyEmailUseCase } from './use-case/verify-email.usecase';
import { ResendVerificationUseCase } from './use-case/resend-verification.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, StudentProfile, EmployerProfile, Resume]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    TokenService,
    SignupUseCase,
    LoginUseCase,
    GoogleUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    GetMeUseCase,
    EmailService,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
  ],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, AuthService],
})
export class AuthModule {}
