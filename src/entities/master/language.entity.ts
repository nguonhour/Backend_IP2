import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentLanguage } from '../../modules/student-profiles/student-language.entity';

@Entity('m_languages')
export class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => StudentLanguage, (studentLanguage) => studentLanguage.language)
  studentLanguages: StudentLanguage[];
}
