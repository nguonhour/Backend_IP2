import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesSeeder } from './seeders/01-roles.seeder';
import { UsersSeeder } from './seeders/02-users.seeder';
import { JobCategoriesSeeder } from './seeders/03-job-categories.seeder';
import { JobTypesSeeder } from './seeders/04-job-types.seeder';
import { JobStatusesSeeder } from './seeders/05-job-statuses.seeder';
import { IndustriesSeeder } from './seeders/06-industries.seeder';
import { EmployerProfilesSeeder } from './seeders/07-employer-profiles.seeder';
import { JobsSeeder } from './seeders/08-jobs.seeder';
import { ApplicationStatusesSeeder } from './seeders/09-application-statuses.seeder';
import {
  ApplicationStatus,
  Industry,
  JobCategory,
  JobStatus,
  JobType,
  Major,
  Role,
  Skill,
  University,
} from '../../entities/master';
import { User } from '../../modules/users/user.entity';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
import { Job } from '../../modules/jobs/job.entity';
import { EmployerReview } from '../../modules/reviews/employer-review.entity';
import { Payment } from '../../modules/payments/payment.entity';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';
import { Application } from '../../modules/applications/application.entity';
import { JobView } from '../../modules/jobs/job-view.entity';
import { SavedJob } from '../../modules/jobs/saved-job.entity';
import { JobSkill } from '../../modules/jobs/job-skill.entity';
import { JobHistory } from '../../modules/jobs/job-history.entity';
import { Report } from '../../modules/reports/report.entity';
import { Resume } from '../../modules/resumes/resume.entity';
import { ApplicationStatusHistory } from '../../modules/applications/application-status-history.entity';
import { StudentSkill } from '../../modules/student-profiles/student-skill.entity';
import { SearchHistory } from '../../modules/student-profiles/search-history.entity';
import { Notification } from '../../modules/notifications/notification.entity';

// function parsePort(value: string): number {
//   const parsed = Number.parseInt(value, 10);
//   if (Number.isNaN(parsed)) {
//     throw new Error(`Invalid DB_PORT value: ${value}`);
//   }
//   return parsed;
// }

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // host: process.env.DB_HOST ?? 'localhost',
      // port: parsePort(process.env.DB_PORT ?? '5432'),
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME,
      entities: [
        Role,
        User,
        Industry,
        EmployerReview,
        Payment,
        EmployerProfile,
        Job,
        JobCategory,
        JobType,
        Application,
        JobView,
        SavedJob,
        JobSkill,
        Skill,
        Report,
        JobHistory,
        JobStatus,
        Resume,
        ApplicationStatus,
        ApplicationStatusHistory,
        StudentProfile,
        StudentSkill,
        University,
        Major,
        SearchHistory,
        Notification,
      ],
      synchronize: parseBoolean(process.env.DB_SYNC, false),
      dropSchema: parseBoolean(process.env.DB_DROP_SCHEMA, false),
    }),

    TypeOrmModule.forFeature([
      Role,
      User,
      Industry,
      EmployerProfile,
      Job,
      JobCategory,
      JobType,
      JobStatus,
      ApplicationStatus,
    ]),
  ],

  providers: [
    RolesSeeder,
    UsersSeeder,
    IndustriesSeeder,
    EmployerProfilesSeeder,
    JobCategoriesSeeder,
    JobTypesSeeder,
    JobStatusesSeeder,
    JobsSeeder,
    ApplicationStatusesSeeder,
  ],
})
export class SeedModule {}
