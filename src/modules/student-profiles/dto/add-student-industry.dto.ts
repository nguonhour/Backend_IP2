import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AddStudentIndustryDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  industries: string[];
}
