import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { createHash } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerProfile } from '../../employer-profiles/employer-profile.entity';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepo: Repository<EmployerProfile>,
  ) {}

  async execute(
    email: string,
    password: string,
    role: string,
    res: Response,
    employerData?: { companyName: string; contactNumber: string; position: string; companyWebsite?: string },
  ) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing.data) {
      throw new ConflictException('Email already exists');
    }

    const hashed = this.hashPassword(password);

    const { data: user } = await this.userRepo.create({
      email,
      password: hashed,
      is_verified: false,
      role,
    });

    if (!user) {
      throw new InternalServerErrorException('Unable to create user');
    }

    // Create employer profile if role is employer
    if (role.toUpperCase() === 'EMPLOYER') {
      const employerProfile = this.employerProfileRepo.create({
        user: { id: user.id },
        companyName: employerData?.companyName || 'Unknown Company',
        contactEmail: user.email,
      });
      await this.employerProfileRepo.save(employerProfile);
    }

    const tokens = this.tokenService.generateTokens(user);
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: role,
      },
    };
  }

  private hashPassword(password: string): string {
    if (!password) {
      throw new InternalServerErrorException('Invalid password');
    }

    return createHash('sha256').update(password).digest('hex');
  }
}
