import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.entity';
import { Job } from '../jobs/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      StudentProfile,
      // ReportStatus,
      ReportType,
      Job,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
