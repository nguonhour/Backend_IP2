import { Module } from '@nestjs/common';
import { EmployerProfilesController } from './employer-profiles.controller';
import { EmployerProfilesService } from './employer-profiles.service';
import { EmployerProfile } from './employer-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [TypeOrmModule.forFeature([EmployerProfile])],
  controllers: [EmployerProfilesController],
  providers: [EmployerProfilesService],
})
export class EmployerProfilesModule {}
