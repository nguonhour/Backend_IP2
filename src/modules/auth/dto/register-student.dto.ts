import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class RegisterStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn(['student'])
  role: string;
}
