import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Industry } from '../../entities/master/industry.entity';
import { Job } from '../jobs/job.entity';
import { EmployerReview } from '../reviews/employer-review.entity';
import { Payment } from '../payments/payment.entity';

@Entity('employer_profiles')
export class EmployerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_name', type: 'varchar', nullable: false })
  companyName: string;

  @ManyToOne(() => Industry, { nullable: true })
  @JoinColumn({ name: 'industry_id' })
  industry: Industry;

  // @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  // latitude: number;

  // @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  // longitude: number;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ name: 'contact_email', type: 'varchar', nullable: true })
  contactEmail: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  about: string | null;

  @Column({ name: 'company_size', type: 'varchar', nullable: true })
  companySize: string | null;

  @Column({ name: 'founded_at', type: 'date', nullable: true })
  foundedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({
    name: 'current_plan_type',
    type: 'varchar',
    nullable: true,
    default: 'basic',
  })
  currentPlanType: string;

  @Column({ name: 'job_post_limit', type: 'int', nullable: true, default: 2 })
  jobPostLimit: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.employer)
  jobs: Job[];

  @OneToMany(() => EmployerReview, (review) => review.employer)
  reviews: EmployerReview[];

  @OneToMany(() => Payment, (payment) => payment.employer)
  payments: Payment[];
}
