import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  description: string;

  // @IsString()
  // @IsOptional()
  // requirements?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  jobTypeId?: string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsUUID()
  @IsOptional()
  employerId?: string;

  @IsNumber()
  @Min(1)
  numberOfOpenings: number;
}
