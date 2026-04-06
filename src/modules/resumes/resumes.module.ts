import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './resume.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resume])],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
