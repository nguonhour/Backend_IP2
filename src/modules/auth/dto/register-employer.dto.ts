import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class RegisterEmployerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  companyName: string;

  @IsString()
  @MinLength(10)
  contactNumber: string;

  @IsIn(['employer'])
  role: string;

  @IsString()
  position: string;

  @IsUrl()
  @IsOptional()
  companyWebsite?: string;
}
