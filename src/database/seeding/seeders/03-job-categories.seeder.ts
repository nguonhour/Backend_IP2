import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobCategory } from '../../../entities/master';

@Injectable()
export class JobCategoriesSeeder implements Seeder {
  private readonly logger = new Logger(JobCategoriesSeeder.name);

  constructor(
    @InjectRepository(JobCategory)
    private readonly jobCategoryRepository: Repository<JobCategory>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding job categories...');

    const categories = [
      'Software Development',
      'Data & Analytics',
      'Design',
      'Marketing',
      'Sales',
    ];

    for (const name of categories) {
      const existing = await this.jobCategoryRepository.findOne({
        where: { name },
      });
      if (!existing) {
        await this.jobCategoryRepository.save(
          this.jobCategoryRepository.create({ name, isActive: true }),
        );
        this.logger.log(`Seeded job category: ${name}`);
      }
    }
  }
}
