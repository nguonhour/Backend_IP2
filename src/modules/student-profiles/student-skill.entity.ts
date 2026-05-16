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
import { Skill } from '../../entities/master/skill.entity';

@Entity('student_skills')
@Unique(['studentId', 'skillId'])
export class StudentSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => StudentProfile, (student) => student.studentSkills)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Skill, (skill) => skill.studentSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
