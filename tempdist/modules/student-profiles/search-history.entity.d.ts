import { StudentProfile } from './student-profile.entity';
export declare class SearchHistory {
    id: string;
    student: StudentProfile;
    searchQuery: string;
    searchedAt: Date;
}
