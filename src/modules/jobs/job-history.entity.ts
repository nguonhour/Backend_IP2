import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity('job_history')
export class JobHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.history)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
