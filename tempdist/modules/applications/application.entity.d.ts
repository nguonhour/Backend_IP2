import { Job } from '../jobs/job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Resume } from '../resumes/resume.entity';
import { ApplicationStatus } from '../../entities/master/application-status.entity';
import { ApplicationStatusHistory } from './application-status-history.entity';
export declare class Application {
    id: string;
    job: Job;
    student: StudentProfile;
    resume: Resume;
    currentStatus: ApplicationStatus;
    appliedAt: Date;
    statusHistory: ApplicationStatusHistory[];
}
