import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfile } from './student-profile.entity';
import { SearchHistory } from './search-history.entity';
import { StudentSkill } from './student-skill.entity';
import { StudentIndustry } from './student-industry.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { Job } from '../jobs/job.entity';
import { Resume } from '../resumes/resume.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { User } from '../users/user.entity';
import { Skill } from '../../entities/master/skill.entity';
import { Industry } from '../../entities/master/industry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      SearchHistory,
      StudentSkill,
      StudentIndustry,
      SavedJob,
      Job,
      Resume,
      University,
      Major,
      User,
      Skill,
      Industry,
    ]),
  ],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
})
export class StudentProfilesModule {}
