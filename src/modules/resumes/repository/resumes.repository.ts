import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../resume.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ResumesRepository extends BaseRepository<Resume> {
  protected resumeRepository: Repository<Resume>;
  constructor(
    @InjectRepository(Resume)
    resumeRepository: Repository<Resume>,
  ) {
    super(resumeRepository);
    this.resumeRepository = resumeRepository;
  }

  async findByStudentId(studentId: string, relations?: string[]) {
    try {
      return await this.resumeRepository.find({
        where: { student: { id: studentId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByStudentId', error, { studentId });
    }
  }

  async findPrimary(studentId: string, relations?: string[]) {
    try {
      return await this.resumeRepository.findOne({
        where: { student: { id: studentId }, isPrimary: true } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findPrimary', error, { studentId });
    }
  }

  async markAsPrimary(resumeId: string, studentId: string) {
    try {
      await this.resumeRepository.update(
        { student: { id: studentId } } as any,
        { isDefault: false },
      );
      return await this.resumeRepository.update({ id: resumeId } as any, {
        isDefault: true,
      });
    } catch (error) {
      return this.handleError('markAsPrimary', error, { resumeId, studentId });
    }
  }
}
