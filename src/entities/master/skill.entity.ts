import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentSkill } from '../../modules/student-profiles/student-skill.entity';
import { JobSkill } from '../../modules/jobs/job-skill.entity';

@Entity('m_skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.skill)
  studentSkills: StudentSkill[];

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.skill)
  jobSkills: JobSkill[];
}
