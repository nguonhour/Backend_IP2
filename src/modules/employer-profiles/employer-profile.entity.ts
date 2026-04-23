import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
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

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  companyName: string;

  @ManyToOne(() => Industry, { nullable: true })
  @JoinColumn({ name: 'industry_id' })
  industry: Industry;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.employer)
  jobs: Job[];

  @OneToMany(() => EmployerReview, (review) => review.employer)
  reviews: EmployerReview[];

  @OneToMany(() => Payment, (payment) => payment.employer)
  payments: Payment[];
}
