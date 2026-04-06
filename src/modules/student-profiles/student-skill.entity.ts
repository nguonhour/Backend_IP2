import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { Skill } from '../../entities/master/skill.entity';

@Entity('student_skills')
export class StudentSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile, (student) => student.studentSkills)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Skill, (skill) => skill.studentSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
