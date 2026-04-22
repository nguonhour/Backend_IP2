import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Job } from './job.entity';

@Unique('UQ_saved_jobs_student_job', ['student', 'job'])
@Entity('saved_jobs')
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile, (student) => student.savedJobs)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Job, (job) => job.savedBy)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
