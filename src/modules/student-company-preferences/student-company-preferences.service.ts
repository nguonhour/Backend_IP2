import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCompanyPreference } from './student-company-preference.entity';

@Injectable()
export class StudentCompanyPreferencesService {
  constructor(
    @InjectRepository(StudentCompanyPreference)
    private repo: Repository<StudentCompanyPreference>,
  ) {}

  async upsert(studentId: string, employerId: string, payload: { blocked?: boolean; muted?: boolean }) {
    const existing = await this.repo
      .createQueryBuilder('pref')
      .innerJoin('pref.student', 'student')
      .innerJoin('pref.employer', 'employer')
      .where('student.id = :studentId', { studentId })
      .andWhere('employer.id = :employerId', { employerId })
      .getOne();

    if (existing) {
      existing.blocked = payload.blocked ?? existing.blocked
      existing.muted = payload.muted ?? existing.muted
      return this.repo.save(existing)
    }

    const created = this.repo.create({
      student: { id: studentId } as any,
      employer: { id: employerId } as any,
      blocked: payload.blocked ?? false,
      muted: payload.muted ?? false,
    } as any)

    return this.repo.save(created)
  }

  async findByStudent(studentId: string) {
    return this.repo.find({ where: { student: { id: studentId } }, relations: ['employer'] })
  }
}
