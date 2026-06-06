import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../services/email.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<string | void> {
    if (!email) throw new BadRequestException('Email is required');

    const { data: user } = await this.userRepo.findByEmail(email);

    // Always return success to avoid revealing whether the account exists
    if (!user) {
      return;
    }

    // Generate a secure token and store its hash
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.updateResetToken(user.id, tokenHash, expiresAt);

    // Send reset email (EmailService may be a no-op in non-configured environments)
    return await this.emailService.sendResetPasswordEmail(user.email, token);
  }
}
