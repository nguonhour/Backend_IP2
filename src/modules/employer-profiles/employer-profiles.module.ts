import { Module } from '@nestjs/common';
import { EmployerProfilesController } from './employer-profiles.controller';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfile } from './employer-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployerProfile, User, Industry])],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService],
})
export class EmployerProfilesModule {}
