import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatusHistory } from './application-status-history.entity';
import { Application } from './application.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { ApplicationStatus } from '../../entities/master/application-status.entity';
import { Job } from '../jobs/job.entity';
import { Resume } from '../resumes/resume.entity';
import { ApplicationsRepository } from './repository/applications.repository';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([
      ApplicationStatusHistory,
      Application,
      StudentProfile,
      ApplicationStatus,
      Job,
      Resume,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationsRepository],
  exports: [ApplicationsRepository],
})
export class ApplicationsModule {}
