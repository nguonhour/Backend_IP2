import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { ReportType } from './report-type.enum';
import { ReportStatus } from './report-status.enum';

@Entity('reports')
@Index(['userId', 'createdAt'])
@Index(['jobId', 'status'])
@Index(['status', 'createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'job_id', nullable: true })
  jobId: string | null;

  @ManyToOne(() => Job, (job) => job.reports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job | null;

  @Column({
    type: 'varchar',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'varchar',
    enum: ReportStatus,
    default: ReportStatus.OPEN,
  })
  status: ReportStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'resolved_by_admin_id' })
  resolvedByAdminId: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'resolved_at' })
  resolvedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
