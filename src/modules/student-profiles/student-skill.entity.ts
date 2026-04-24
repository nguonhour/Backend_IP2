import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { Skill } from '../../entities/master/skill.entity';

@Entity('student_skills')
export class StudentSkill {
  @PrimaryColumn({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => StudentProfile, (student) => student.studentSkills)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Skill, (skill) => skill.studentSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
