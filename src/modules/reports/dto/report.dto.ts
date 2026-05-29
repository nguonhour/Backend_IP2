import {
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ReportType } from '../report-type.enum';

export class CreateReportDto {
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  jobId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ResolveReportDto {
  @IsString()
  @IsEnum(['REMOVE_JOB', 'SUSPEND_EMPLOYER', 'DISMISS', 'OTHER'])
  action: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  adminNotes: string;
}
