import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddStudentEducationDto {
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @IsString()
  @IsOptional()
  educationLevel?: string;

  @IsString()
  @IsOptional() 
  fieldOfStudy?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString() 
  @IsOptional()  
  endDate?: string;
}