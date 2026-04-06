import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';

@Entity('job_views')
export class JobView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.views)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => StudentProfile)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  viewedAt: Date;
}
