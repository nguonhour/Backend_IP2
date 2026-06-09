// Backend_IP2/src/modules/student-profiles/student-education.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from './student-profile.entity';

@Entity('student_educations')
export class StudentEducation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'institution_name', type: 'text' })
  institutionName: string;

  @Column({ name: 'education_level', type: 'text', nullable: true })
  educationLevel: string | null;

  @Column({ name: 'field_of_study', type: 'text', nullable: true })
  fieldOfStudy: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @ManyToOne(() => StudentProfile, (student) => student.educations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;
}