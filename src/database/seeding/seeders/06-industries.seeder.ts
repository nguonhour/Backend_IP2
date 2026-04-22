import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { Industry } from '../../../entities/master';

@Injectable()
export class IndustriesSeeder implements Seeder {
  private readonly logger = new Logger(IndustriesSeeder.name);

  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding industries...');

    const industries = ['Technology', 'Education', 'Healthcare'];

    for (const name of industries) {
      const existing = await this.industryRepository.findOne({
        where: { name },
      });
      if (!existing) {
        await this.industryRepository.save(
          this.industryRepository.create({ name, isActive: true }),
        );
        this.logger.log(`Seeded industry: ${name}`);
      }
    }
  }
}
