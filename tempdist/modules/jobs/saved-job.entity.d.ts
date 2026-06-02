import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Job } from './job.entity';
export declare class SavedJob {
    studentId: string;
    jobId: string;
    student: StudentProfile;
    job: Job;
}
