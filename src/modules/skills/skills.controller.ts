import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async getSkills() {
    return this.skillsService.getSkills();
  }

  @Get(':id')
  async getSkillById(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.getSkillById(id);
  }
}
