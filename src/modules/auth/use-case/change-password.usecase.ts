import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string, oldPassword: string, newPassword: string) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Missing required fields');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const user = await this.userRepo.findByIdWithRole(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.authProvider !== 'LOCAL' || !user.passwordHash) {
      throw new BadRequestException(
        'Password changes are only available for email/password accounts',
      );
    }

    const oldPasswordHash = this.hashPassword(oldPassword);
    const legacyPlainTextMatch = user.passwordHash === oldPassword;

    if (user.passwordHash !== oldPasswordHash && !legacyPlainTextMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const newPasswordHash = this.hashPassword(newPassword);
    await this.userRepo.updatePasswordHash(user.id, newPasswordHash);

    return { message: 'Password changed successfully' };
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }
}
