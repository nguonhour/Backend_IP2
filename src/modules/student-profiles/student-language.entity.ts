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
import { Language } from '../../entities/master/language.entity';

@Entity('student_languages')
@Unique(['studentId', 'languageId'])
export class StudentLanguage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'language_id', type: 'uuid' })
  languageId: string;

  @Column({ name: 'level', type: 'varchar', nullable: false })
  level: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => StudentProfile, (student) => student.studentLanguages)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Language, (language) => language.studentLanguages)
  @JoinColumn({ name: 'language_id' })
  language: Language;
}
