import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { JobStatus } from '../../../entities/master';

@Injectable()
export class JobStatusesSeeder implements Seeder {
  private readonly logger = new Logger(JobStatusesSeeder.name);

  constructor(
    @InjectRepository(JobStatus)
    private readonly jobStatusRepository: Repository<JobStatus>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding job statuses...');

    const statuses = ['Open', 'Closed'];

    for (const name of statuses) {
      const existing = await this.jobStatusRepository.findOne({
        where: { name },
      });
      if (!existing) {
        await this.jobStatusRepository.save(
          this.jobStatusRepository.create({ name, isActive: true }),
        );
        this.logger.log(`Seeded job status: ${name}`);
      }
    }
  }
}
