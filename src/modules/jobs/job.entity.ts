import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { JobCategory } from '../../entities/master/job-category.entity';
import { JobType } from '../../entities/master/job-type.entity';
import { JobStatus } from '../../entities/master/job-status.entity';
import { Application } from '../applications/application.entity';
import { JobView } from './job-view.entity';
import { SavedJob } from './saved-job.entity';
import { JobSkill } from './job-skill.entity';
import { Report } from '../reports/report.entity';
import { JobHistory } from './job-history.entity';
import { JobApprovalStatus } from './job-approval-status.enum';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EmployerProfile, (employer) => employer.jobs)
  @JoinColumn({ name: 'employer_id' })
  employer: EmployerProfile;

  @ManyToOne(() => JobCategory)
  @JoinColumn({ name: 'category_id' })
  category: JobCategory;

  @ManyToOne(() => JobType, { nullable: true })
  @JoinColumn({ name: 'job_type_id' })
  jobType: JobType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude: number;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salaryMin: number;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salaryMax: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ name: 'number_of_openings', type: 'int' })
  numberOfOpenings: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ name:'is_blocked', type: 'boolean', default: false})
  is_blocked: boolean

  @ManyToOne(() => JobStatus)
  @JoinColumn({ name: 'status_id' })
  status: JobStatus;

  @Column({
    name: 'approval_status',
    type: 'varchar',
    enum: JobApprovalStatus,
    default: JobApprovalStatus.PENDING_APPROVAL,
  })
  approvalStatus: JobApprovalStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @OneToMany(() => JobView, (view) => view.job)
  views: JobView[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job)
  savedBy: SavedJob[];

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job)
  jobSkills: JobSkill[];

  @OneToMany(() => Report, (report) => report.job)
  reports: Report[];

  @OneToMany(() => JobHistory, (history) => history.job)
  history: JobHistory[];
}
