import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateEmployerProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

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
}
