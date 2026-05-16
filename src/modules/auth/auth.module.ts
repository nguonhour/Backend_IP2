import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Role } from '../../entities/master/role.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Resume } from '../resumes/resume.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { SignupUseCase } from './use-case/signup.usecase';
import { LoginUseCase } from './use-case/login.usecase';
import { GoogleUseCase } from './use-case/google.usecase';
import { RefreshTokenUseCase } from './use-case/refresh-token.usecase';
import { UserRepository } from './repositories/user.repository';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetMeUseCase } from './use-case/getMe_usecase';
import { EmailService } from './services/email.service';
import { VerifyEmailUseCase } from './use-case/verify-email.usecase';
import { ResendVerificationUseCase } from './use-case/resend-verification.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, StudentProfile, Resume, EmployerProfile])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    TokenService,
    SignupUseCase,
    LoginUseCase,
    GoogleUseCase,
    RefreshTokenUseCase,
    JwtAuthGuard,
    GetMeUseCase,
    EmailService,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
  ],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
