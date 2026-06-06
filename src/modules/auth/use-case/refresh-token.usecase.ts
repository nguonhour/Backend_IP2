import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { UserStatus } from '../../users/user-status.enum';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Hash the provided refresh token to compare with stored hash
    const tokenHash = this.hashToken(refreshToken);

    // Find user by refresh token hash
    const user = await this.userRepo.findByRefreshTokenHash(tokenHash);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        `Your account is ${user.status.toLowerCase().replace('_', ' ')}`,
      );
    }

    // Generate new tokens
    const tokens = this.tokenService.generateTokens(user);

    // Update refresh token
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
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

  private hashToken(token: string): string {
    return Buffer.from(token).toString('base64url');
  }
}
