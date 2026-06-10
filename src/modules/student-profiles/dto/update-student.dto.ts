import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  aboutMe?: string;

  @IsOptional()
  @IsArray()
  experiences?: Array<{ title: string; description: string }>;

  @IsOptional()
  @IsArray()
  expertise?: string[];

  @IsOptional()
  @IsArray()
  languages?: Array<{ language: string; level: string }>;

  // @IsOptional()
  // @IsInt()
  // yearOfStudy?: number;

  @IsOptional()
  @IsString()
  quote?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  // @IsOptional()
  // @IsString()
  // universityName?: string;

  // @IsOptional()
  // @IsString()
  // majorName?: string;
}
