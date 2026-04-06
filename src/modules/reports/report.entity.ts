import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Job } from '../jobs/job.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile)
  @JoinColumn({ name: 'reporter_id' })
  reporter: StudentProfile;

  @ManyToOne(() => Job, (job) => job.reports)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  status: string;
}
