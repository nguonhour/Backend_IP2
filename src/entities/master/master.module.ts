// src/entities/master/master.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Skill } from './skill.entity';
import { University } from './university.entity';
import { Major } from './major.entity';
import { Industry } from './industry.entity';
import { JobCategory } from './job-category.entity';
import { JobType } from './job-type.entity';
import { JobStatus } from './job-status.entity';
import { ApplicationStatus } from './application-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role, Skill, University, Major, Industry,
      JobCategory, JobType, JobStatus, ApplicationStatus,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class MasterModule {}