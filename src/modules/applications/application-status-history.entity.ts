import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { ApplicationStatus } from '../../entities/master/application-status.entity';
import { User } from '../users/user.entity';

@Entity('application_status_history')
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, (application) => application.statusHistory)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @ManyToOne(() => ApplicationStatus, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status: ApplicationStatus;

  @ManyToOne(() => User, (user) => user.applicationStatusChanges, {
    nullable: true,
  })
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;
}
