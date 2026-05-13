import {
  IsEmail,
  IsIn,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsIn(['student'])
  role: string;
}
