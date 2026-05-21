import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './resume.entity';
import { ResumesRepository } from './repository/resumes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Resume])],
  controllers: [ResumesController],
  providers: [ResumesService, ResumesRepository],
  exports: [ResumesRepository],
})
export class ResumesModule {}
