import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Application } from '../../modules/applications/application.entity';

@Entity('m_application_statuses')
export class ApplicationStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Application, (application) => application.currentStatus)
  applications: Application[];
}
