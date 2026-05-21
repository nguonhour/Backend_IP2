import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';

@Unique('UQ_student_employer_pref', ['student', 'employer'])
@Entity('student_company_preferences')
export class StudentCompanyPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => EmployerProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employer_id' })
  employer: EmployerProfile;

  @Column({ type: 'boolean', default: false })
  blocked: boolean;

  @Column({ type: 'boolean', default: false })
  muted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
