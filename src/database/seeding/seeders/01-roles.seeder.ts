import { Injectable, Logger } from '@nestjs/common';
import { Seeder } from '../seed.interface';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Role } from '../../../entities/master';

@Injectable()
export class RolesSeeder implements Seeder {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding roles...');

    const rolesToSeed = [
      { name: 'ADMIN' },
      { name: 'EMPLOYER' },
      { name: 'STUDENT' },
    ];

    for (const roleData of rolesToSeed) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        this.logger.log(`Seeded role: ${roleData.name}`);
      } else {
        this.logger.debug(`Role ${roleData.name} already exists. Skipping.`);
      }
    }
  }
}
