import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { EmployerProfile } from '../../../modules/employer-profiles/employer-profile.entity';
import { User } from '../../../modules/users/user.entity';
import { Industry } from '../../../entities/master';

@Injectable()
export class EmployerProfilesSeeder implements Seeder {
  private readonly logger = new Logger(EmployerProfilesSeeder.name);

  constructor(
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepository: Repository<EmployerProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding employer profiles...');

    const employerEmail = 'employer1@gmail.com';

    const user = await this.userRepository.findOne({
      where: { email: employerEmail },
    });

    if (!user) {
      this.logger.error('Employer user not found. Run Users seeder first.');
      return;
    }

    const industry = await this.industryRepository.findOne({
      where: { name: 'Technology' },
    });

    if (!industry) {
      this.logger.error('Industry not found. Run Industries seeder first.');
      return;
    }

    const existing = await this.employerProfileRepository.findOne({
      where: {
        user: { id: user.id },
      },
      relations: ['user'],
    });

    if (existing) {
      this.logger.debug('Employer profile already exists. Skipping.');
      return;
    }

    const profile = this.employerProfileRepository.create({
      user,
      industry,
      companyName: 'TechNova Co., Ltd.',
      location: 'Phnom Penh',
      contactEmail: 'hr@technova.example.com',
      avatarUrl: null,
    });

    await this.employerProfileRepository.save(profile);

    this.logger.log(`Created employer profile for: ${employerEmail}`);
  }
}
