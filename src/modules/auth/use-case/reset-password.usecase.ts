import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(email: string, token: string, newPassword: string) {
    if (!email || !token || !newPassword) {
      throw new BadRequestException('Missing required fields');
    }

    const { data: user } = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    if (!user.resetTokenHash || user.resetTokenHash !== tokenHash) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash the new password similarly to login flow (sha256 used elsewhere)
    const hashedPassword = createHash('sha256').update(newPassword).digest('hex');

    await this.userRepo.updatePasswordHash(user.id, hashedPassword);
    await this.userRepo.clearResetToken(user.id);
  }
}
