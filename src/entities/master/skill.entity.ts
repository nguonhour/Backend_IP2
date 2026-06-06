import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentSkill } from '../../modules/student-profiles/student-skill.entity';
import { JobSkill } from '../../modules/jobs/job-skill.entity';

@Entity('m_skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.skill)
  studentSkills: StudentSkill[];

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.skill)
  jobSkills: JobSkill[];
}
