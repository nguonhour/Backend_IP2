import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobHistory } from './job-history.entity';
import { JobSkill } from './job-skill.entity';
import { JobView } from './job-view.entity';
import { SavedJob } from './saved-job.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Job, JobHistory, JobSkill, JobView, SavedJob])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
