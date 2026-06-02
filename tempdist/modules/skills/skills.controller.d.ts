import { SkillsService } from './skills.service';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    getSkills(): Promise<import("../../entities/master").Skill[]>;
    getSkillById(id: string): Promise<import("../../entities/master").Skill>;
}
