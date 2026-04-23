import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerProfile } from './employer-profile.entity';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';

@Injectable()
export class EmployerProfilesService {
  constructor(
    @InjectRepository(EmployerProfile)
    private employerProfileRepository: Repository<EmployerProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Industry)
    private industryRepository: Repository<Industry>,
  ) {}

  async create(userId: string, dto: CreateEmployerProfileDto) {
    const existingProfile = await this.employerProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingProfile) {
      throw new ConflictException('Employer profile already exists');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.industryId) {
      const industry = await this.industryRepository.findOne({
        where: { id: dto.industryId },
      });
      if (!industry) {
        throw new NotFoundException('Industry not found');
      }
    }

    const profile = this.employerProfileRepository.create({
      companyName: dto.companyName,
      location: dto.location,
      contactEmail: dto.contactEmail,
      avatarUrl: dto.avatarUrl,
      user: { id: user.id },
      industry: dto.industryId ? ({ id: dto.industryId } as Industry) : undefined,
    });

    return this.employerProfileRepository.save(profile);
  }

  async findByUserId(userId: string) {
    const profile = await this.employerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'industry'],
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return profile;
  }

  async findById(id: string) {
    const profile = await this.employerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'industry'],
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return profile;
  }

  async update(userId: string, dto: UpdateEmployerProfileDto) {
    const profile = await this.findByUserId(userId);

    if (dto.industryId) {
      const industry = await this.industryRepository.findOne({
        where: { id: dto.industryId },
      });
      if (!industry) {
        throw new NotFoundException('Industry not found');
      }
    }

    Object.assign(profile, {
      companyName: dto.companyName ?? profile.companyName,
      location: dto.location ?? profile.location,
      contactEmail: dto.contactEmail ?? profile.contactEmail,
      avatarUrl: dto.avatarUrl ?? profile.avatarUrl,
      industry: dto.industryId ? ({ id: dto.industryId } as Industry) : profile.industry,
      updatedAt: new Date(),
    });

    return this.employerProfileRepository.save(profile);
  }

  async delete(userId: string) {
    const profile = await this.findByUserId(userId);
    await this.employerProfileRepository.remove(profile);
    return { message: 'Employer profile deleted successfully' };
  }
}
