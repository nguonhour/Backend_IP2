import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService
  ) {}


  async execute(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is missing');
    }

    const tokenHash = this.hashToken(token);
    const user = await this.userRepo.findByEmailVerificationTokenHash(tokenHash);
    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.userRepo.markEmailVerified(user.id);

    const tokens = this.tokenService.generateTokens(user);
    return { 
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
      },
      message: 'Email verified successfully' 
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
