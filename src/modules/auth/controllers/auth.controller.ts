import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly googleUseCase: GoogleUseCase,
  ) {}

  @Post('signup')
  signup(
    @Body() dto: RegisterStudentDto | RegisterEmployerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signupUseCase.execute(
      dto.email,
      dto.password,
      dto.role,
      res,
      dto as any,
    );
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
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
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
}
