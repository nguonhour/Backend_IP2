import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { Job } from '../jobs/job.entity';

@Injectable()
export class StudentProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async saveJob(userId: string, jobId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const existing = await this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('saved_job.job = :jobId', { jobId })
      .getOne();

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const savedJob = this.savedJobRepository.create({
      job: { id: job.id },
      student: { id: student.id },
    });

    return this.savedJobRepository.save(savedJob);
  }

  async getSavedJobs(userId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    return this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoinAndSelect('saved_job.job', 'job')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .orderBy('saved_job.id', 'DESC')
      .getMany()
      .then((results) => results.map((r) => r.job));
  }

  async removeSavedJob(userId: string, jobId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const savedJob = await this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('saved_job.job = :jobId', { jobId })
      .getOne();

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    await this.savedJobRepository.remove(savedJob);
    return { message: 'Job removed from saved list' };
  }

  private async getStudentProfileByUserId(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }
}
