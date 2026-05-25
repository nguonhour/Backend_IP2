import {
  ConflictException,
  ForbiddenException,
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
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Resume } from '../resumes/resume.entity';
import { EmployerApplicationHistoryDto } from './dto/employer-application-history.dto';
import { NotificationService } from '../notifications/notifications.service';
// import { ApplicationStatus } from './application-status.enum';

const INITIAL_APPLICATION_STATUS_NAMES = ['pending', 'applied'];

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
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    private notificationService: NotificationService,
  ) {}

  async applyToJob(userId: string, dto: CreateApplicationDto) {
    const student = await this.getStudentProfileByUserId(userId);

    // Check if already applied
    const existing = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.student', 'student')
      .where('student.id = :studentId', { student: { id: student.id } })
      .andWhere('application.job = :jobId', { jobId: dto.jobId })
      .getOne();

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // Get job
    const job = await this.jobRepository.findOne({
      where: { id: dto.jobId },
      relations: ['status', 'employer', 'employer.user'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    this.ensureJobIsOpenForApplications(job);

    const resume = dto.resumeId
      ? await this.getResumeOwnedByUser(dto.resumeId, userId)
      : await this.getDefaultResumeForUser(userId);

    // Get initial application status
    const initialStatus = await this.applicationStatusRepository
      .createQueryBuilder('status')
      .where('LOWER(status.name) IN (:...names)', {
        names: INITIAL_APPLICATION_STATUS_NAMES,
      })
      .orderBy(
        `CASE
          WHEN LOWER(status.name) = 'pending' THEN 0
          WHEN LOWER(status.name) = 'applied' THEN 1
          ELSE 2
        END`,
      )
      .getOne();
    if (!initialStatus) {
      throw new NotFoundException('Application status not found');
    }

    // Create application
    const application = this.applicationRepository.create({
      job: { id: job.id },
      student: { id: student.id },
      resume: resume ? { id: resume.id } : undefined,
      currentStatus: { id: initialStatus.id },
    });

    const savedApplication = await this.applicationRepository.save(application);

    await this.applicationStatusHistoryRepository.save(
      this.applicationStatusHistoryRepository.create({
        application: { id: savedApplication.id },
        status: { id: initialStatus.id },
        changedBy: { id: userId },
      }),
    );

    if (job.employer?.user?.id) {
      const studentName = `${student.firstName} ${student.lastName}`.trim();
      await this.notificationService.create({
        user_id: job.employer.user.id,
        type: 'APPLICATION_CREATED',
        reference_id: savedApplication.id,
        message: `${studentName || 'A student'} applied to ${job.title}`,
      });
    }

    return this.getApplicationById(savedApplication.id, userId);
  }

  async getMyApplications(userId: string, status?: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const query = this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('job.employer', 'employer')
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
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.university', 'university')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('application.resume', 'resume')
      .leftJoinAndSelect('application.statusHistory', 'statusHistory')
      .innerJoin('application.student', 'studentProfile')
      .where('studentProfile.id = :studentId', { studentId: student.id })
      .andWhere('application.id = :id', { id })
      .orderBy('statusHistory.changedAt', 'DESC')
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async getAllApplications(filters?: {
    today?: boolean;
    hired?: boolean;
  }) {
    const query = this.applicationRepository
      .createQueryBuilder('applicant')
      .leftJoinAndSelect('applicant.currentStatus', 'status');

    if (filters?.hired) {
      query.andWhere(
        '(LOWER(status.name) = :accepted OR LOWER(status.name) = :hired)',
        {
          accepted: 'accepted',
          hired: 'hired',
        },
      );
    }

    if (filters?.today) {
      query.andWhere('DATE(applicant.appliedAt) = CURRENT_DATE');
    }

    return query.getMany();
  }

  async getEmployerDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const activeJobStatuses = ['published', 'active', 'open'];
    const hiredStatuses = ['accepted', 'hired'];
    const hireGoal = 10;

    const scopedApplications = () =>
      this.applicationRepository
        .createQueryBuilder('application')
        .innerJoin('application.job', 'job')
        .innerJoin('job.employer', 'employer')
        .innerJoin('employer.user', 'employerUser')
        .where('employerUser.id = :userId', { userId });

    const [
      activeJobs,
      activeJobsDelta,
      totalApplicants,
      newApplicantsToday,
      hiredThisMonthResult,
      pipelineRows,
      recentApplications,
    ] = await Promise.all([
      this.jobRepository
        .createQueryBuilder('job')
        .innerJoin('job.employer', 'employer')
        .innerJoin('employer.user', 'employerUser')
        .innerJoin('job.status', 'status')
        .where('employerUser.id = :userId', { userId })
        .andWhere('LOWER(status.name) IN (:...activeJobStatuses)', {
          activeJobStatuses,
        })
        .andWhere('(job.deadline IS NULL OR job.deadline >= CURRENT_DATE)')
        .getCount(),
      this.jobRepository
        .createQueryBuilder('job')
        .innerJoin('job.employer', 'employer')
        .innerJoin('employer.user', 'employerUser')
        .innerJoin('job.status', 'status')
        .where('employerUser.id = :userId', { userId })
        .andWhere('LOWER(status.name) IN (:...activeJobStatuses)', {
          activeJobStatuses,
        })
        .andWhere('(job.deadline IS NULL OR job.deadline >= CURRENT_DATE)')
        .andWhere('job.createdAt >= :startOfWeek', { startOfWeek })
        .getCount(),
      scopedApplications().getCount(),
      scopedApplications()
        .andWhere('application.appliedAt >= :today', { today })
        .getCount(),
      this.applicationStatusHistoryRepository
        .createQueryBuilder('history')
        .select('COUNT(DISTINCT application.id)', 'count')
        .innerJoin('history.application', 'application')
        .innerJoin('history.status', 'status')
        .innerJoin('application.job', 'job')
        .innerJoin('job.employer', 'employer')
        .innerJoin('employer.user', 'employerUser')
        .where('employerUser.id = :userId', { userId })
        .andWhere('LOWER(status.name) IN (:...hiredStatuses)', {
          hiredStatuses,
        })
        .andWhere('history.changedAt >= :startOfMonth', { startOfMonth })
        .getRawOne<{ count: string }>(),
      scopedApplications()
        .innerJoin('application.currentStatus', 'status')
        .select('LOWER(status.name)', 'status')
        .addSelect('COUNT(application.id)', 'count')
        .groupBy('LOWER(status.name)')
        .getRawMany<{ status: string; count: string }>(),
      this.applicationRepository
        .createQueryBuilder('application')
        .innerJoinAndSelect('application.job', 'job')
        .innerJoin('job.employer', 'employer')
        .innerJoin('employer.user', 'employerUser')
        .innerJoinAndSelect('application.currentStatus', 'status')
        .innerJoinAndSelect('application.student', 'student')
        .leftJoinAndSelect('student.user', 'studentUser')
        .leftJoinAndSelect('student.university', 'university')
        .leftJoinAndSelect('student.major', 'major')
        .leftJoinAndSelect('application.resume', 'resume')
        .where('employerUser.id = :userId', { userId })
        .orderBy('application.appliedAt', 'DESC')
        .take(10)
        .getMany(),
    ]);

    const hiredThisMonth = Number(hiredThisMonthResult?.count ?? 0);

    return {
      stats: {
        activeJobs,
        activeJobsDelta,
        totalApplicants,
        newApplicantsToday,
        hiredThisMonth,
        hiredGoalPercent: Math.min(
          Math.round((hiredThisMonth / hireGoal) * 100),
          100,
        ),
      },
      pipeline: this.toPipelineCounts(pipelineRows),
      recentApplications,
    };
  }

  async getStudentApplicationHistory(applicationId: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, student: { id: student.id } },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationStatusHistoryRepository
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.status', 'status')
      .leftJoinAndSelect('history.changedBy', 'changedBy')
      .where('history.application = :applicationId', { applicationId })
      .orderBy('history.changedAt', 'DESC')
      .getMany();
  }

  async getCandidatePipeline(userId: string, filters?: { jobId?: string }) {
    const query = this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.university', 'university')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('application.resume', 'resume')
      .innerJoin('job.employer', 'employer')
      .innerJoin('employer.user', 'employerUser')
      .where('employerUser.id = :userId', { userId });

    if (filters?.jobId) {
      query.andWhere('job.id = :jobId', { jobId: filters.jobId });
    }

    const applications = await query
      .orderBy('status.name', 'ASC')
      .addOrderBy('application.appliedAt', 'DESC')
      .getMany();

    const pipeline = {
      pending: [] as Application[],
      reviewed: [] as Application[],
      interviewing: [] as Application[],
      offered: [] as Application[],
      rejected: [] as Application[],
    };

    for (const app of applications) {
      const statusName = app.currentStatus.name.toLowerCase();
      if (statusName === 'pending' || statusName === 'applied') {
        pipeline.pending.push(app);
      } else if (statusName === 'reviewed') {
        pipeline.reviewed.push(app);
      } else if (statusName === 'interviewing') {
        pipeline.interviewing.push(app);
      } else if (statusName === 'offered') {
        pipeline.offered.push(app);
      } else if (statusName === 'rejected') {
        pipeline.rejected.push(app);
      }
    }

    return pipeline;
  }

  async getEmployerInbox(
    userId: string,
    filters: { jobId?: string; status?: string },
  ) {
    const query = this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.university', 'university')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('application.resume', 'resume')
      .innerJoin('job.employer', 'employer')
      .innerJoin('employer.user', 'employerUser')
      .where('employerUser.id = :userId', { userId });

    if (filters.jobId) {
      query.andWhere('job.id = :jobId', { jobId: filters.jobId });
    }

    if (filters.status) {
      query.andWhere('LOWER(status.name) = LOWER(:status)', {
        status: filters.status,
      });
    }

    return query.orderBy('application.appliedAt', 'DESC').getMany();
  }

  async getApplicantsForJob(userId: string, jobId: string, status?: string) {
    await this.ensureEmployerOwnsJob(jobId, userId);

    return this.getEmployerInbox(userId, { jobId, status });
  }

  async getEmployerApplicationHistory(
    userId: string,
    filters: EmployerApplicationHistoryDto,
  ) {
    const query = this.applicationStatusHistoryRepository
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.application', 'application')
      .innerJoinAndSelect('history.status', 'status')
      .leftJoinAndSelect('history.changedBy', 'changedBy')
      .innerJoin('application.job', 'job')
      .innerJoin('job.employer', 'employer')
      .innerJoin('employer.user', 'employerUser')
      .where('employerUser.id = :userId', { userId });

    if (filters.jobId) {
      query.andWhere('job.id = :jobId', { jobId: filters.jobId });
    }

    if (filters.applicationId) {
      query.andWhere('application.id = :applicationId', {
        applicationId: filters.applicationId,
      });
    }

    if (filters.startDate) {
      query.andWhere('history.changedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('history.changedAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return query.orderBy('history.changedAt', 'DESC').getMany();
  }

  async getEmployerApplicationById(id: string, userId: string) {
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoinAndSelect('application.currentStatus', 'status')
      .innerJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.university', 'university')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('application.resume', 'resume')
      .leftJoinAndSelect('application.statusHistory', 'statusHistory')
      .innerJoin('job.employer', 'employer')
      .innerJoin('employer.user', 'employerUser')
      .where('application.id = :id', { id })
      .andWhere('employerUser.id = :userId', { userId })
      .orderBy('statusHistory.changedAt', 'DESC')
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateApplicationStatus(
    id: string,
    userId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.employer', 'job.employer.user', 'currentStatus'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employer.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    const nextStatus = await this.applicationStatusRepository.findOne({
      where: { id: dto.statusId },
    });
    if (!nextStatus) {
      throw new NotFoundException('Application status not found');
    }

    const isMovingToAccepted = this.isAcceptedStatusName(nextStatus.name);
    const isAlreadyAccepted = this.isAcceptedStatusName(
      application.currentStatus?.name,
    );

    if (isMovingToAccepted && !isAlreadyAccepted) {
      const job = await this.jobRepository.findOne({
        where: { id: application.job.id },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.numberOfOpenings !== null && job.numberOfOpenings !== undefined) {
        if (job.numberOfOpenings <= 0) {
          throw new ConflictException('No openings remaining for this job');
        }
        job.numberOfOpenings -= 1;
        await this.jobRepository.save(job);
      }
    }

    if (!isMovingToAccepted && isAlreadyAccepted) {
      const job = await this.jobRepository.findOne({
        where: { id: application.job.id },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.numberOfOpenings !== null && job.numberOfOpenings !== undefined) {
        job.numberOfOpenings += 1;
        await this.jobRepository.save(job);
      }
    }

    application.currentStatus = {
      id: dto.statusId,
    } as Application['currentStatus'];
    await this.applicationRepository.save(application);

    await this.applicationStatusHistoryRepository.save(
      this.applicationStatusHistoryRepository.create({
        application: { id: application.id },
        status: { id: nextStatus.id },
        changedBy: { id: userId },
      }),
    );

    return this.getEmployerApplicationById(id, userId);
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

  private async ensureEmployerOwnsJob(jobId: string, userId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.user'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employer.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this job',
      );
    }
  }

  private ensureJobIsOpenForApplications(job: Job) {
    const statusName = job.status?.name?.toLowerCase().trim();

    if (
      !statusName ||
      ['draft', 'closed', 'filled', 'expired', 'paused'].includes(statusName)
    ) {
      throw new ForbiddenException('This job is not open for applications');
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new ForbiddenException(
        'This job is no longer accepting applications',
      );
    }

    if (
      job.numberOfOpenings !== null &&
      job.numberOfOpenings !== undefined &&
      job.numberOfOpenings <= 0
    ) {
      throw new ForbiddenException('This job has no openings remaining');
    }
  }

  private isAcceptedStatusName(statusName?: string | null) {
    const normalized = (statusName ?? '').trim().toLowerCase();
    return normalized === 'accepted' || normalized === 'hired';
  }

  private toPipelineCounts(rows: { status: string; count: string }[]) {
    const pipeline = {
      pending: 0,
      reviewed: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
    };

    for (const row of rows) {
      const status = (row.status ?? '').trim().toLowerCase();
      const count = Number(row.count ?? 0);

      if (status === 'pending' || status === 'applied') {
        pipeline.pending += count;
      } else if (status === 'reviewed') {
        pipeline.reviewed += count;
      } else if (status === 'interviewing') {
        pipeline.interviewing += count;
      } else if (status === 'offered') {
        pipeline.offered += count;
      } else if (status === 'rejected') {
        pipeline.rejected += count;
      }
    }

    return pipeline;
  }

  private async getResumeOwnedByUser(resumeId: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, studentId: student.id },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  private async getDefaultResumeForUser(userId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    return this.resumeRepository.findOne({
      where: { studentId: student.id, isDefault: true },

      order: { createdAt: 'DESC' },
    });
  }
}
