import { IsArray, IsString } from 'class-validator';

export class SetStudentSkillDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
