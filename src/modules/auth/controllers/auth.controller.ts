import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterEmployerDto } from '../dto/register-employer.dto';
import { RegisterStudentDto } from '../dto/register-student.dto';
import { LoginDto } from '../dto/login.dto';
import { SignupUseCase } from '../use-case/signup.usecase';
import { LoginUseCase } from '../use-case/login.usecase';
import { RefreshTokenUseCase } from '../use-case/refresh-token.usecase';
import { GoogleAuthDto } from '../dto/google.dto';
import { GoogleUseCase } from '../use-case/google.usecase';
import type { AuthenticatedRequest } from '../../../common/types/auth-request.type';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetMeUseCase } from '../use-case/getMe_usecase';

type AuthUserResponse = {
  id: string;
  email: string;
  role: string;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUserResponse;
};

type StudentSignupData = {
  name: string;
  avatarUrl?: string;
  cvUrl?: string;
};

type EmployerSignupData = {
  name: string;
  companyName: string;
  position: string;
  companyWebsite?: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly googleUseCase: GoogleUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: AuthenticatedRequest) {
    // return this.getMeUseCase.execute(req.user.id);
    return { userId: req.user.id };
  }

  @Post('signup')
  signup(
    @Body() dto: RegisterStudentDto | RegisterEmployerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const additionalData: StudentSignupData | EmployerSignupData =
      'companyName' in dto
        ? this.buildEmployerSignupData(dto)
        : this.buildStudentSignupData(dto);

    return this.signupUseCase.execute(
      dto.email,
      dto.password,
      dto.role,
      res,
      additionalData,
    );
  }

  private buildStudentSignupData(dto: {
    name: string;
    avatarUrl?: string;
    cvUrl?: string;
  }): StudentSignupData {
    return {
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      cvUrl: dto.cvUrl,
    };
  }

  private buildEmployerSignupData(
    dto: RegisterEmployerDto,
  ): EmployerSignupData {
    return {
      name: dto.name,
      companyName: dto.companyName,
      position: dto.position,
      companyWebsite: dto.companyWebsite,
    };
  }
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.loginUseCase.execute(dto.email, dto.password, res);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies =
      (req.cookies as { refresh_token?: string } | undefined) ?? undefined;
    const refreshToken = cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return this.refreshTokenUseCase.execute(refreshToken, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });

    return { message: 'Logged out successfully' };
  }

  @Post('google')
  google(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.googleUseCase.execute(dto.access_token, dto.role, res);
  }

  // Debug endpoint to verify cookies and headers received by the server
  @Get('debug-cookies')
  debugCookies(@Req() req: Request) {
    return {
      cookies: (req.cookies as Record<string, any> | undefined) ?? {},
      headers: req.headers,
    };
  }
}
