import { Job } from './job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
export declare class JobView {
    id: string;
    job: Job;
    student: StudentProfile;
    viewedAt: Date;
}
