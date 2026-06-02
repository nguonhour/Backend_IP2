import { Injectable, Logger } from '@nestjs/common';
import { Seeder } from '../seed.interface';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

// Import JSON using require to avoid needing --resolveJsonModule in tsconfig
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jobsData: any = require('../data/jobs.json');
import { Job } from '../../../modules/jobs/job.entity';
import { JobCategory, JobStatus, JobType } from '../../../entities/master';
import { EmployerProfile } from '../../../modules/employer-profiles/employer-profile.entity';
import { User } from '../../../modules/users/user.entity';

@Injectable()
export class JobsSeeder implements Seeder {
  private readonly logger = new Logger(JobsSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepository: Repository<EmployerProfile>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobType)
    private readonly jobTypeRepository: Repository<JobType>,
    @InjectRepository(JobStatus)
    private readonly jobStatusRepository: Repository<JobStatus>,
    @InjectRepository(JobCategory)
    private readonly jobCategoryRepository: Repository<JobCategory>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding Jobs from JSON...');

    const employerEmail = 'employer1@gmail.com';

    const employerUser = await this.userRepository.findOne({
      where: { email: employerEmail },
    });
    const employer = employerUser
      ? await this.employerProfileRepository.findOne({
          where: { user: { id: employerUser.id } },
          relations: ['user'],
        })
      : null;

    const [category] = await this.jobCategoryRepository.find({ take: 1 });
    const [jobType] = await this.jobTypeRepository.find({ take: 1 });
    const [status] = await this.jobStatusRepository.find({ take: 1 });

    // Safety check: Ensure the related data exists before we try to create jobs
    if (!employer || !category || !jobType || !status) {
      this.logger.error(
        'Missing related data! Ensure Employers, Categories, Types, and Statuses are seeded first.',
      );
      return;
    }

    const jobsArray =
      (jobsData as unknown as { default?: typeof jobsData }).default ??
      jobsData;

    // 2. Loop through the imported JSON array
    for (const jobData of jobsArray) {
      const existingJob = await this.jobRepository.findOne({
        where: {
          title: jobData.title,
          employer: { id: employer.id },
        },
        relations: ['employer'],
      });

      if (existingJob) {
        this.logger.debug(`Job already exists: ${jobData.title}. Skipping.`);
        continue;
      }

      // 3. Map the JSON data to the Entity, replacing placeholders with REAL database IDs
      const newJob = this.jobRepository.create({
        ...jobData,
        imageUrl: jobData.imageUrl ?? undefined,
        employer,
        category,
        jobType,
        status,
        // Convert the string deadline from JSON into a proper JavaScript Date object
        deadline: new Date(jobData.deadline),
      });

      await this.jobRepository.save(newJob);
      this.logger.log(`Created job: ${jobData.title}`);
    }
  }
}
