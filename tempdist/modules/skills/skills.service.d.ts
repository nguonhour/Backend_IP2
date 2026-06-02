import { Repository } from 'typeorm';
import { Skill } from '../../entities/master/skill.entity';
export declare class SkillsService {
    private readonly skillRepository;
    constructor(skillRepository: Repository<Skill>);
    getSkills(): Promise<Skill[]>;
    getSkillById(id: string): Promise<Skill>;
}
