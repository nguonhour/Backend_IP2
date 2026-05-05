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
import { StudentProfile } from '../../student-profiles/student-profile.entity';
import { Resume } from '../../resumes/resume.entity';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository?: Repository<StudentProfile>,
    @InjectRepository(Resume)
    private readonly resumeRepository?: Repository<Resume>,
  ) {}

  async execute(
    email: string,
    password: string,
    role: string,
    res: Response,
    additionalData?: Record<string, any>,
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

    // If student signup includes profile data, create initial StudentProfile and Resume
    if (
      role === 'student' &&
      additionalData &&
      this.studentProfileRepository
    ) {
      const displayName = (additionalData.name ?? '').trim();
      const [firstName, ...rest] = displayName.split(' ');
      const lastName = rest.join(' ') || '';

      const profile = this.studentProfileRepository.create({
        user: { id: user.id },
        firstName: firstName || displayName || 'Student',
        lastName: lastName,
        avatarUrl: additionalData.avatarUrl ?? null,
      });

      const savedProfile = await this.studentProfileRepository.save(profile);

      if (additionalData.cvUrl && this.resumeRepository) {
        const resume = this.resumeRepository.create({
          studentId: savedProfile.id,
          fileUrl: additionalData.cvUrl,
          isDefault: true,
        });

        await this.resumeRepository.save(resume);
      }
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
        role: user.role?.name,
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
