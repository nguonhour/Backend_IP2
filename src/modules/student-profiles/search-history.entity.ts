import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentProfile } from './student-profile.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentProfile, (student) => student.searchHistory)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @Column()
  searchQuery: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  searchedAt: Date;
}
