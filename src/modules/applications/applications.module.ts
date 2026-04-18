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

@Module({
  imports: [
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
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
