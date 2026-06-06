import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ApplicationsRepository extends BaseRepository<Application> {
  constructor(
    @InjectRepository(Application)
    applicationRepository: Repository<Application>,
  ) {
    super(applicationRepository);
  }

  async findByStudentId(studentId: string, relations?: string[]) {
    try {
      return await this.repository.find({
        where: { student: { id: studentId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByStudentId', error, { studentId });
    }
  }

  async findByJobId(jobId: string, relations?: string[]) {
    try {
      return await this.repository.find({
        where: { job: { id: jobId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByJobId', error, { jobId });
    }
  }

  async findByStudentAndJob(studentId: string, jobId: string) {
    try {
      return await this.repository.findOne({
        where: {
          student: { id: studentId },
          job: { id: jobId },
        } as any,
      });
    } catch (error) {
      return this.handleError('findByStudentAndJob', error, {
        studentId,
        jobId,
      });
    }
  }
}
