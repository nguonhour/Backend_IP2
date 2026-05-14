import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../services/email.service';

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const { data: user } = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.userRepo.updateEmailVerification(user.id, tokenHash, expiresAt);
    await this.emailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent' };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
