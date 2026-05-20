import { Module } from '@nestjs/common';
import { EmployerProfilesController } from './employer-profiles.controller';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfile } from './employer-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';
import { EmployerProfilesRepository } from './repository/employer-profiles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployerProfile, User, Industry])],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService, EmployerProfilesRepository],
  exports: [EmployerProfilesRepository],
})
export class EmployerProfilesModule {}
