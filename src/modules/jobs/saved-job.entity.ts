import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Job } from './job.entity';

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
