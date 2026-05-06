import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { Job } from '../jobs/job.entity';
import { Resume } from '../resumes/resume.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';

@Injectable()
export class StudentProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(University)
    private universityRepository: Repository<University>,
    @InjectRepository(Major)
    private majorRepository: Repository<Major>,
  ) {}

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
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

  async getSavedJobs(userId: string): Promise<Job[]> {
    const student = await this.getStudentProfileByUserId(userId);

    return this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoinAndSelect('saved_job.job', 'job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.jobType', 'jobType')
      .leftJoinAndSelect('job.status', 'status')
      .leftJoinAndSelect('job.employer', 'employer')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .orderBy('saved_job.id', 'DESC')
      .getMany()
      .then((results) => results.map((r) => r.job));
  }

  async removeSavedJob(
    userId: string,
    jobId: string,
  ): Promise<{ message: string }> {
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
    let student = await this.studentProfileRepository.findOne({
      where: { externalUserId: userId },
      relations: ['user'],
    });

    if (!student) {
      const orphanProfile = await this.studentProfileRepository.findOne({
        where: { externalUserId: IsNull() },
        order: { createdAt: 'DESC' },
      });

      if (orphanProfile) {
        orphanProfile.externalUserId = userId;
        student = await this.studentProfileRepository.save(orphanProfile);
      }
    }

    // Auto-create profile if it doesn't exist (for CV saves without prior profile creation)
    if (!student) {
      try {
        const profile = new StudentProfile();
        profile.firstName = 'Student';
        profile.lastName = '';
        profile.user = null;
        profile.externalUserId = userId;
        student = await this.studentProfileRepository.save(profile);
        console.log('Auto-created StudentProfile:', student.id);
      } catch (err) {
        console.error('Failed to auto-create StudentProfile:', err);
        throw new NotFoundException(
          `Student profile not found for user ${userId}`,
        );
      }
    }

    return student;
  }

  async getProfile(userId: string): Promise<StudentProfile | null> {
    const student = await this.getStudentProfileByUserId(userId);

    const profile = await this.studentProfileRepository.findOne({
      where: { id: student.id },
      relations: ['user', 'university', 'major', 'studentSkills'],
    });

    return profile || null;
  }

  async updateProfile(
    userId: string,
    dto: Partial<{
      firstName: string;
      lastName: string;
      avatarUrl: string;
      yearOfStudy: number;
      universityName: string;
      majorName: string;
    }>,
  ): Promise<StudentProfile> {
    const student = await this.getStudentProfileByUserId(userId);

    if (dto.firstName !== undefined) student.firstName = dto.firstName;
    if (dto.lastName !== undefined) student.lastName = dto.lastName;
    if (dto.avatarUrl !== undefined) student.avatarUrl = dto.avatarUrl;
    if (dto.yearOfStudy !== undefined) student.yearOfStudy = dto.yearOfStudy;

    if (dto.universityName !== undefined) {
      const normalizedUniversityName = dto.universityName.trim();
      if (!normalizedUniversityName) {
        student.university = null;
      } else {
        student.university = await this.findOrCreateUniversity(
          normalizedUniversityName,
        );
      }
    }

    if (dto.majorName !== undefined) {
      const normalizedMajorName = dto.majorName.trim();
      if (!normalizedMajorName) {
        student.major = null;
      } else {
        student.major = await this.findOrCreateMajor(normalizedMajorName);
      }
    }

    return this.studentProfileRepository.save(student);
  }

  private async findOrCreateUniversity(name: string): Promise<University> {
    const existing = await this.universityRepository
      .createQueryBuilder('university')
      .where('LOWER(university.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.universityRepository.save(existing);
      }
      return existing;
    }

    const created = this.universityRepository.create({ name, isActive: true });
    return this.universityRepository.save(created);
  }

  private async findOrCreateMajor(name: string): Promise<Major> {
    const existing = await this.majorRepository
      .createQueryBuilder('major')
      .where('LOWER(major.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.majorRepository.save(existing);
      }
      return existing;
    }

    const created = this.majorRepository.create({ name, isActive: true });
    return this.majorRepository.save(created);
  }

  async addResume(userId: string, fileUrl: string): Promise<Resume> {
    const student = await this.getStudentProfileByUserId(userId);
    console.log('Adding resume for student:', student.id);

    // Mark any existing default resumes as non-default using QueryBuilder
    await this.resumeRepository
      .createQueryBuilder()
      .update(Resume)
      .set({ isDefault: false })
      .where('student_id = :studentId', { studentId: student.id })
      .andWhere('is_default = :isDefault', { isDefault: true })
      .execute();

    // Create and save the new resume
    const resume = this.resumeRepository.create({
      fileUrl,
      isDefault: true,
      studentId: student.id,
    });

    return this.resumeRepository.save(resume);
  }
}
