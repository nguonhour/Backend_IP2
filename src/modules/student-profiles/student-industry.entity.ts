import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { Industry } from '../../entities/master/industry.entity';

@Entity('student_industries_preference')
@Unique(['studentId', 'industryId'])
export class StudentIndustry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'industry_id', type: 'uuid' })
  industryId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
//   updatedAt: Date;

  @ManyToOne(() => StudentProfile, (student) => student.studentIndustries)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Industry, (industry) => industry.studentIndustries)
  @JoinColumn({ name: 'industry_id' })
  industry: Industry;
}
