import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  yearOfStudy?: number;

  @IsOptional()
  @IsString()
  universityName?: string;

  @IsOptional()
  @IsString()
  majorName?: string;
}
