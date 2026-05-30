import { StudentProfile } from './student-profile.entity';
import { Skill } from '../../entities/master/skill.entity';
export declare class StudentSkill {
    id: string;
    studentId: string;
    skillId: string;
    createdAt: Date;
    updatedAt: Date;
    student: StudentProfile;
    skill: Skill;
}
