import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { RolesSeeder } from './seeders/01-roles.seeder';
import { UsersSeeder } from './seeders/02-users.seeder';
import { JobCategoriesSeeder } from './seeders/03-job-categories.seeder';
import { JobTypesSeeder } from './seeders/04-job-types.seeder';
import { JobStatusesSeeder } from './seeders/05-job-statuses.seeder';
import { IndustriesSeeder } from './seeders/06-industries.seeder';
import { EmployerProfilesSeeder } from './seeders/07-employer-profiles.seeder';
import { JobsSeeder } from './seeders/08-jobs.seeder';

async function bootstrap() {
  const logger = new Logger('SeederOrchestrator');

  const app = await NestFactory.createApplicationContext(SeedModule);

  try {
    logger.log('Starting database seeding...');

    const rolesSeeder = app.get(RolesSeeder);
    const usersSeeder = app.get(UsersSeeder);
    const industriesSeeder = app.get(IndustriesSeeder);
    const employerProfilesSeeder = app.get(EmployerProfilesSeeder);
    const jobCategoriesSeeder = app.get(JobCategoriesSeeder);
    const jobTypesSeeder = app.get(JobTypesSeeder);
    const jobStatusesSeeder = app.get(JobStatusesSeeder);
    const jobsSeeder = app.get(JobsSeeder);

    await rolesSeeder.run();
    await usersSeeder.run();
    await industriesSeeder.run();
    await employerProfilesSeeder.run();
    await jobCategoriesSeeder.run();
    await jobTypesSeeder.run();
    await jobStatusesSeeder.run();
    await jobsSeeder.run();

    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Database seeding failed', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
