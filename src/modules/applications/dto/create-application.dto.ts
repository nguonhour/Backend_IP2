import { IsOptional, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  jobId: string;

  @IsUUID()
  @IsOptional()
  resumeId?: string;
}
