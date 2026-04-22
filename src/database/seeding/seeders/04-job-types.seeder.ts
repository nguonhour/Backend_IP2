import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobType, Type } from '../../../entities/master';

@Injectable()
export class JobTypesSeeder implements Seeder {
  private readonly logger = new Logger(JobTypesSeeder.name);

  constructor(
    @InjectRepository(JobType)
    private readonly jobTypeRepository: Repository<JobType>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding job types...');

    const types = Object.values(Type);

    for (const name of types) {
      const existing = await this.jobTypeRepository.findOne({
        where: { name },
      });
      if (!existing) {
        await this.jobTypeRepository.save(
          this.jobTypeRepository.create({ name, isActive: true }),
        );
        this.logger.log(`Seeded job type: ${name}`);
      }
    }
  }
}
