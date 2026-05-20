import {
  IsEmail,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateEmployerProfileDto {
  @IsString()
  @MaxLength(255)
  companyName: string;

  @IsUUID()
  @IsOptional()
  industryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  about?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  companySize?: string;

  @IsDateString()
  @IsOptional()
  foundedAt?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;
}
