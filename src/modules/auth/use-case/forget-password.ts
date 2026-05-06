import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ForgetPasswordDto {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(email: string, res: Response) {
    // find user by email
    const { data: user } = await this.userRepo.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res
      .status(200)
      .json({ message: 'Password reset link sent to email' });
  }
}
