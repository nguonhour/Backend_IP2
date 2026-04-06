import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';

@Entity('employer_reviews')
export class EmployerReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => EmployerProfile, (employer) => employer.reviews)
  @JoinColumn({ name: 'employer_id' })
  employer: EmployerProfile;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  reviewText: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
