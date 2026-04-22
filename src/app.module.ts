import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

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
import { EmployerNotificationModule } from './modules/employer-notification/employer-notification.module';


function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        const databaseUrl = requireEnv('DATABASE_URL').trim();

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: true,
          ssl: {
            rejectUnauthorized: false,
          },
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
    EmployerNotificationModule,
  
  ],
})
export class AppModule {}
