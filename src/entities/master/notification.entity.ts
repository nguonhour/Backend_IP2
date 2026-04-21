import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  type: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}