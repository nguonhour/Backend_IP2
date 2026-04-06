import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { Job } from '../jobs/job.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EmployerProfile, (employer) => employer.payments)
  @JoinColumn({ name: 'employer_id' })
  employer: EmployerProfile;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionRef: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
