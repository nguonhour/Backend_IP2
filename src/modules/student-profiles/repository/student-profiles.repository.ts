import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from '../student-profile.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class StudentProfilesRepository extends BaseRepository<StudentProfile> {
  protected studentRepository: Repository<StudentProfile>;
  constructor(
    @InjectRepository(StudentProfile)
    studentRepository: Repository<StudentProfile>,
  ) {
    super(studentRepository);
    this.studentRepository = studentRepository;
  }

  async findByUserId(userId: string, relations?: string[]) {
    try {
      return await this.studentRepository.findOne({
        where: { user: { id: userId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByUserId', error, { userId });
    }
  }

  async findByUniversity(universityId: string, relations?: string[]) {
    try {
      return await this.studentRepository.find({
        where: { university: { id: universityId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByUniversity', error, { universityId });
    }
  }

  async findByMajor(majorId: string, relations?: string[]) {
    try {
      return await this.studentRepository.find({
        where: { major: { id: majorId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByMajor', error, { majorId });
    }
  }

  async findVerified(relations?: string[]) {
    try {
      return await this.studentRepository.find({
        where: { isVerified: true } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findVerified', error, { relations });
    }
  }
}
