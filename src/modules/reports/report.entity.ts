import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reporter_id' })
  reporter: StudentProfile;

  @ManyToOne(() => Job, (job) => job.reports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job | null;

  @Column({ type: 'text' })
  reason: string;

  @ManyToOne(() => ReportStatus, (status) => status.reports)
  @JoinColumn({ name: 'report_status_id' })
  status: ReportStatus;

  @ManyToOne(() => ReportType, (reportType) => reportType.reports)
  @JoinColumn({ name: 'report_type_id' })
  reportType: ReportType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
