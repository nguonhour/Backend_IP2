import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AddStudentSkillDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    skills: string[];
}