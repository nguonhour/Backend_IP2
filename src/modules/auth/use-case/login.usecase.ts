import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string, password: string, res: Response) {
    // Find user by email
    const { data: user } = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const hashedPassword = this.hashPassword(password);
    const storedPassword = user.passwordHash ?? '';
    const legacyPlainTextMatch = storedPassword === password;

    if (storedPassword !== hashedPassword && !legacyPlainTextMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (legacyPlainTextMatch) {
      await this.userRepo.updatePasswordHash(user.id, hashedPassword);
    }

    // Generate tokens
    const tokens = this.tokenService.generateTokens(user);

    // Update refresh token
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);

    // Set refresh token as httpOnly cookie. Use secure+samesite settings
    // appropriate for production vs local development.
    const isProd = process.env.NODE_ENV === 'production'

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
      },
    };
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }
}
