import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class EmployerApplicationHistoryDto {
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
