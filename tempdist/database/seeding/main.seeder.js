"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const seed_module_1 = require("./seed.module");
const _01_roles_seeder_1 = require("./seeders/01-roles.seeder");
const _02_users_seeder_1 = require("./seeders/02-users.seeder");
const _03_job_categories_seeder_1 = require("./seeders/03-job-categories.seeder");
const _04_job_types_seeder_1 = require("./seeders/04-job-types.seeder");
const _05_job_statuses_seeder_1 = require("./seeders/05-job-statuses.seeder");
const _06_industries_seeder_1 = require("./seeders/06-industries.seeder");
const _07_employer_profiles_seeder_1 = require("./seeders/07-employer-profiles.seeder");
const _08_jobs_seeder_1 = require("./seeders/08-jobs.seeder");
async function bootstrap() {
    const logger = new common_1.Logger('SeederOrchestrator');
    const app = await core_1.NestFactory.createApplicationContext(seed_module_1.SeedModule);
    try {
        logger.log('Starting database seeding...');
        const rolesSeeder = app.get(_01_roles_seeder_1.RolesSeeder);
        const usersSeeder = app.get(_02_users_seeder_1.UsersSeeder);
        const industriesSeeder = app.get(_06_industries_seeder_1.IndustriesSeeder);
        const employerProfilesSeeder = app.get(_07_employer_profiles_seeder_1.EmployerProfilesSeeder);
        const jobCategoriesSeeder = app.get(_03_job_categories_seeder_1.JobCategoriesSeeder);
        const jobTypesSeeder = app.get(_04_job_types_seeder_1.JobTypesSeeder);
        const jobStatusesSeeder = app.get(_05_job_statuses_seeder_1.JobStatusesSeeder);
        const jobsSeeder = app.get(_08_jobs_seeder_1.JobsSeeder);
        await rolesSeeder.run();
        await usersSeeder.run();
        await industriesSeeder.run();
        await employerProfilesSeeder.run();
        await jobCategoriesSeeder.run();
        await jobTypesSeeder.run();
        await jobStatusesSeeder.run();
        await jobsSeeder.run();
        logger.log('Database seeding completed successfully!');
    }
    catch (error) {
        logger.error('Database seeding failed', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap().catch((error) => {
    const logger = new common_1.Logger('SeederBootstrap');
    logger.error('Unexpected error during seeding', error);
    process.exit(1);
});
//# sourceMappingURL=main.seeder.js.map