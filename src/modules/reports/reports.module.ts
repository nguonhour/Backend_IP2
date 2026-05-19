import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Report, StudentProfile])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
