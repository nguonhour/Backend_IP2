import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterEmployerDto } from '../dto/register-employer.dto';
import { RegisterStudentDto } from '../dto/register-student.dto';
import { LoginDto } from '../dto/login.dto';
import { SignupUseCase } from '../use-case/signup.usecase';
import { LoginUseCase } from '../use-case/login.usecase';
import { RefreshTokenUseCase } from '../use-case/refresh-token.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('signup')
  signup(
    @Body() dto: RegisterStudentDto | RegisterEmployerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signupUseCase.execute(dto.email, dto.password, dto.role, res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.loginUseCase.execute(dto.email, dto.password, res);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refresh_token;
    return this.refreshTokenUseCase.execute(refreshToken, res);
  }
}
