import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../../student-profiles/student-profile.entity';
import { Resume } from '../../resumes/resume.entity';
import { EmailService } from '../services/email.service';
import { EmployerProfile } from '../../employer-profiles/employer-profile.entity';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository?: Repository<StudentProfile>,
    @InjectRepository(Resume)
    private readonly resumeRepository?: Repository<Resume>,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepository?: Repository<EmployerProfile>,
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

    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenHash = this.hashToken(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.userRepo.updateEmailVerification(
      user.id,
      verificationTokenHash,
      verificationExpiresAt,
    );

    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // If student signup includes profile data, create initial StudentProfile and Resume
    if (role === 'student' && additionalData && this.studentProfileRepository) {
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

    // If employer signup includes profile data, create initial EmployerProfile
    if (role === 'employer' && additionalData && this.employerProfileRepository) {
      const companyName = (additionalData.companyName ?? additionalData.name ?? '').trim() || 'Employer';

      const profile = this.employerProfileRepository.create({
        user: { id: user.id },
        companyName,
        contactEmail: user.email,
        location: additionalData.location ?? null,
        avatarUrl: additionalData.avatarUrl ?? null,
      });

      await this.employerProfileRepository.save(profile);
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        role: role,
      },
      message: 'Verification email sent',
    };
  }

  private hashPassword(password: string): string {
    if (!password) {
      throw new InternalServerErrorException('Invalid password');
    }

    return createHash('sha256').update(password).digest('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
