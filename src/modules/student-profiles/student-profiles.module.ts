import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfile } from './student-profile.entity';
import { SearchHistory } from './search-history.entity';
import { StudentSkill } from './student-skill.entity';
import { StudentLanguage } from './student-language.entity';
import { StudentIndustry } from './student-industry.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { Job } from '../jobs/job.entity';
import { Resume } from '../resumes/resume.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { User } from '../users/user.entity';
import { Skill } from '../../entities/master/skill.entity';
import { Language } from '../../entities/master/language.entity';
import { Industry } from '../../entities/master/industry.entity';
import { StudentProfilesRepository } from './repository/student-profiles.repository';
import { StudentEducation } from './student-education.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      SearchHistory,
      StudentSkill,
      StudentLanguage,
      StudentIndustry,
      SavedJob,
      Job,
      Resume,
      // University,
      Major,
      User,
      Skill,
      Language,
      Industry,
      StudentEducation,
    ]),
  ],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService, StudentProfilesRepository],
  exports: [StudentProfilesRepository],
})
export class StudentProfilesModule {}
