import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../seed.interface';
import { ApplicationStatus } from '../../../entities/master/application-status.entity';

@Injectable()
export class ApplicationStatusesSeeder implements Seeder {
  private readonly logger = new Logger(ApplicationStatusesSeeder.name);

  constructor(
    @InjectRepository(ApplicationStatus)
    private readonly applicationStatusRepository: Repository<ApplicationStatus>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding application statuses...');

    const statuses = ['Pending', 'Reviewed', 'Interviewing', 'Offered', 'Rejected'];

    for (const name of statuses) {
      const existing = await this.applicationStatusRepository.findOne({
        where: { name },
      });
      if (!existing) {
        await this.applicationStatusRepository.save(
          this.applicationStatusRepository.create({ name, isActive: true }),
        );
        this.logger.log(`Seeded application status: ${name}`);
      }
    }
  }
}
