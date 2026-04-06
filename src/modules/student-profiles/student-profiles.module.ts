import { Module } from '@nestjs/common';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfile } from './student-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './search-history.entity';
import { StudentSkill } from './student-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, SearchHistory, StudentSkill])],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
})
export class StudentProfilesModule {}
