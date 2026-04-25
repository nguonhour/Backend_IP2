import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentProfilesModule } from './modules/student-profiles/student-profiles.module';
import { EmployerProfilesModule } from './modules/employer-profiles/employer-profiles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MasterModule } from './entities/master/master.module';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

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
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        const databaseUrl = requireEnv('DATABASE_URL').trim();
        const synchronize = parseBoolean(process.env.DB_SYNC, false);
        const dropSchema = parseBoolean(process.env.DB_DROP_SCHEMA, false);
        const isSupabase = databaseUrl.includes('supabase.com');
        // const host = (process.env.DB_HOST ?? 'localhost').trim();
        // const port = parsePort(process.env.DB_PORT ?? '5432');
        // const username = requireEnv('DB_USERNAME').trim();
        // const password = requireEnv('DB_PASSWORD').trim();
        // const database = requireEnv('DB_NAME').trim();
        // const synchronize = parseBoolean(process.env.DB_SYNC, false);
        // const dropSchema = parseBoolean(process.env.DB_DROP_SCHEMA, false);

        return {
          type: 'postgres',
          // host,
          // port,
          // username,
          // password,
          // database,
          // autoLoadEntities: true,
          // synchronize,
          // dropSchema,
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize,
          dropSchema,
          ssl: isSupabase ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    StudentProfilesModule,
    EmployerProfilesModule,
    JobsModule,
    ApplicationsModule,
    ResumesModule,
    ReviewsModule,
    NotificationsModule,
    ReportsModule,
    PaymentsModule,
    MasterModule,
  ],
})
export class AppModule {}
