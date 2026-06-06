import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobHistory } from './job-history.entity';
import { JobSkill } from './job-skill.entity';
import { JobView } from './job-view.entity';
import { SavedJob } from './saved-job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { JobCategory } from '../../entities/master/job-category.entity';
import { JobType } from '../../entities/master/job-type.entity';
import { JobStatus } from '../../entities/master/job-status.entity';
import { JobsRepository } from './repository/jobs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      JobSkill,
      JobView,
      SavedJob,
      StudentProfile,
      EmployerProfile,
      JobCategory,
      JobType,
      JobStatus,
      JobHistory,
    ]),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository],
  exports: [JobsRepository],
})
export class JobsModule {}
