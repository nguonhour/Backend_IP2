import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RolesSeeder } from "./seeders/01-roles.seeder";
import { UsersSeeder } from "./seeders/02-users.seeder";
import { JobCategoriesSeeder } from "./seeders/03-job-categories.seeder";
import { JobTypesSeeder } from "./seeders/04-job-types.seeder";
import { JobStatusesSeeder } from "./seeders/05-job-statuses.seeder";
import { IndustriesSeeder } from "./seeders/06-industries.seeder";
import { EmployerProfilesSeeder } from "./seeders/07-employer-profiles.seeder";
import { JobsSeeder } from "./seeders/08-jobs.seeder";
import { ApplicationStatus, Industry, JobCategory, JobStatus, JobType, Major, Role, Skill, University } from "../../entities/master";
import { User } from "../../modules/users/user.entity";
import { EmployerProfile } from "../../modules/employer-profiles/employer-profile.entity";
import { Job } from "../../modules/jobs/job.entity";
import { EmployerReview } from "../../modules/reviews/employer-review.entity";
import { Payment } from "../../modules/payments/payment.entity";
import { StudentProfile } from "../../modules/student-profiles/student-profile.entity";
import { Application } from "../../modules/applications/application.entity";
import { JobView } from "../../modules/jobs/job-view.entity";
import { SavedJob } from "../../modules/jobs/saved-job.entity";
import { JobSkill } from "../../modules/jobs/job-skill.entity";
import { JobHistory } from "../../modules/jobs/job-history.entity";
import { Report } from "../../modules/reports/report.entity";
import { Resume } from "../../modules/resumes/resume.entity";
import { ApplicationStatusHistory } from "../../modules/applications/application-status-history.entity";
import { StudentSkill } from "../../modules/student-profiles/student-skill.entity";
import { SearchHistory } from "../../modules/student-profiles/search-history.entity";
import { Notification } from "../../modules/notifications/notification.entity";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
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
                Report,
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
            synchronize: false,
        }),

        TypeOrmModule.forFeature([Role, User, Industry, EmployerProfile, Job, JobCategory, JobType, JobStatus]),
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
    ],
})

export class SeedModule {}