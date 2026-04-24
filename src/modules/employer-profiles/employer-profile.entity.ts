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

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ name: 'contact_email', type: 'varchar', nullable: true })
  contactEmail: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

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
