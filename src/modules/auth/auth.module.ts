import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Role } from '../../entities/master/role.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { SignupUseCase } from './use-case/signup.usecase';
import { LoginUseCase } from './use-case/login.usecase';
import { RefreshTokenUseCase } from './use-case/refresh-token.usecase';
import { UserRepository } from './repositories/user.repository';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetMeUseCase } from './use-case/getMe_usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, EmployerProfile])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    TokenService,
    SignupUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    JwtAuthGuard,
    GetMeUseCase,
  ],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
