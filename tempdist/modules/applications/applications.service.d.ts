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
import { NotificationService } from '../notifications/notification.service';
export declare class ApplicationsService {
    private applicationRepository;
    private jobRepository;
    private studentProfileRepository;
    private applicationStatusRepository;
    private applicationStatusHistoryRepository;
    private resumeRepository;
    private notificationService;
    constructor(applicationRepository: Repository<Application>, jobRepository: Repository<Job>, studentProfileRepository: Repository<StudentProfile>, applicationStatusRepository: Repository<ApplicationStatus>, applicationStatusHistoryRepository: Repository<ApplicationStatusHistory>, resumeRepository: Repository<Resume>, notificationService: NotificationService);
    applyToJob(userId: string, dto: CreateApplicationDto): Promise<Application>;
    getMyApplications(userId: string, status?: string): Promise<Application[]>;
    getApplicationById(id: string, userId: string): Promise<Application>;
    getAllApplications(filters?: {
        today?: boolean;
        hired?: boolean;
    }): Promise<Application[]>;
    getEmployerDashboard(userId: string): Promise<{
        stats: {
            activeJobs: number;
            activeJobsDelta: number;
            totalApplicants: number;
            newApplicantsToday: number;
            hiredThisMonth: number;
            hiredGoalPercent: number;
        };
        pipeline: {
            pending: number;
            reviewed: number;
            interviewing: number;
            offered: number;
            rejected: number;
        };
        recentApplications: Application[];
    }>;
    getStudentApplicationHistory(applicationId: string, userId: string): Promise<ApplicationStatusHistory[]>;
    getCandidatePipeline(userId: string, filters?: {
        jobId?: string;
    }): Promise<{
        pending: Application[];
        reviewed: Application[];
        interviewing: Application[];
        offered: Application[];
        rejected: Application[];
    }>;
    getEmployerInbox(userId: string, filters: {
        jobId?: string;
        status?: string;
    }): Promise<Application[]>;
    getApplicantsForJob(userId: string, jobId: string, status?: string): Promise<Application[]>;
    getEmployerApplicationHistory(userId: string, filters: EmployerApplicationHistoryDto): Promise<ApplicationStatusHistory[]>;
    getEmployerApplicationById(id: string, userId: string): Promise<Application>;
    updateApplicationStatus(id: string, userId: string, dto: UpdateApplicationStatusDto): Promise<Application>;
    private notifyStudentAboutStatusChange;
    private getNotificationTypeForStatus;
    private formatInterviewDetails;
    private getStudentProfileByUserId;
    private ensureEmployerOwnsJob;
    private ensureJobIsOpenForApplications;
    private isAcceptedStatusName;
    private isInterviewStatusName;
    private toPipelineCounts;
    private getResumeOwnedByUser;
    private getDefaultResumeForUser;
}
