// src/database/seeding/seeders/02-users.seeder.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { User } from '../../../modules/users/user.entity';
import { Role } from '../../../entities/master';

@Injectable()
export class UsersSeeder implements Seeder {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding Users...');

    // 1. Fetch the related data we need
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });
    const employerRole = await this.roleRepository.findOne({
      where: { name: 'EMPLOYER' },
    });
    const studentRole = await this.roleRepository.findOne({
      where: { name: 'STUDENT' },
    });

    if (!adminRole) {
      throw new Error(
        'Admin role not found! Did you run the Roles seeder first?',
      );
    }

    if (!employerRole) {
      throw new Error(
        'Employer role not found! Did you run the Roles seeder first?',
      );
    }

    if (!studentRole) {
      throw new Error(
        'Student role not found! Did you run the Roles seeder first?',
      );
    }

    // 2. Define the user data
    const adminEmail = 'admin@yourplatform.com';
    const employerEmail = 'employer1@gmail.com';
    const studentEmail = 'student1@gmail.com';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });
    const existingEmployer = await this.userRepository.findOne({
      where: { email: employerEmail },
    });
    const existingStudent = await this.userRepository.findOne({
      where: { email: studentEmail },
    });

    // 3. Insert if it doesn't exist
    if (!existingAdmin) {
      const adminUser = this.userRepository.create({
        email: adminEmail,
        passwordHash: this.hashPassword('Password123!'),
        role: adminRole, // Attach the relation
      });

      await this.userRepository.save(adminUser);
      this.logger.log(`Created admin user: ${adminEmail}`);
    } else {
      this.logger.debug(`Admin user already exists. Skipping.`);
    }

    if (!existingEmployer) {
      const employerUser = this.userRepository.create({
        email: employerEmail,
        passwordHash: this.hashPassword('Password123!'),
        role: employerRole,
      });

      await this.userRepository.save(employerUser);
      this.logger.log(`Created employer user: ${employerEmail}`);
    } else {
      this.logger.debug(`Employer user already exists. Skipping.`);
    }

    if (!existingStudent) {
      const studentUser = this.userRepository.create({
        email: studentEmail,
        passwordHash: this.hashPassword('Password123!'),
        role: studentRole,
      });

      await this.userRepository.save(studentUser);
      this.logger.log(`Created student user: ${studentEmail}`);
    } else {
      this.logger.debug(`Student user already exists. Skipping.`);
    }
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }
}
