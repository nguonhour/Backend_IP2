import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCompanyPreference } from './student-company-preference.entity';
import { StudentCompanyPreferencesService } from './student-company-preferences.service';
import { StudentCompanyPreferencesController } from './student-company-preferences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentCompanyPreference])],
  providers: [StudentCompanyPreferencesService],
  controllers: [StudentCompanyPreferencesController],
})
export class StudentCompanyPreferencesModule {}
