import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { Job } from '../jobs/job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { ApplicationStatus } from '../../entities/master/application-status.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatusHistory } from './application-status-history.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(ApplicationStatus)
    private applicationStatusRepository: Repository<ApplicationStatus>,
    @InjectRepository(ApplicationStatusHistory)
    private applicationStatusHistoryRepository: Repository<ApplicationStatusHistory>,
  ) {}

  async applyToJob(userId: string, dto: CreateApplicationDto) {
    const student = await this.getStudentProfileByUserId(userId);

    // Check if already applied
    const existing = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('application.job = :jobId', { jobId: dto.jobId })
      .getOne();

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // Get job
    const job = await this.jobRepository.findOne({ where: { id: dto.jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Get "Applied" status
    const appliedStatus = await this.applicationStatusRepository
      .createQueryBuilder('status')
      .where('LOWER(status.name) = LOWER(:name)', { name: 'Applied' })
      .getOne();
    if (!appliedStatus) {
      throw new NotFoundException('Application status not found');
    }

    // Create application
    const application = this.applicationRepository.create({
      job: { id: job.id },
      student: { id: student.id },
      currentStatus: { id: appliedStatus.id },
    });

    const savedApplication = await this.applicationRepository.save(application);

    await this.applicationStatusHistoryRepository.save(
      this.applicationStatusHistoryRepository.create({
        application: { id: savedApplication.id },
        statusId: appliedStatus.id,
        changedBy: userId,
      }),
    );

    return this.getApplicationById(savedApplication.id, userId);
  }

  async getMyApplications(userId: string, status?: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const query = this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoin('application.student', 'studentProfile')
      .where('studentProfile.id = :studentId', { studentId: student.id });

    if (status) {
      query.andWhere('status.name = :status', { status });
    }

    return query.orderBy('application.appliedAt', 'DESC').getMany();
  }

  async getApplicationById(id: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('application.resume', 'resume')
      .innerJoin('application.student', 'studentProfile')
      .where('studentProfile.id = :studentId', { studentId: student.id })
      .andWhere('application.id = :id', { id })
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
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
