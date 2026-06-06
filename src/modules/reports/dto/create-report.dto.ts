import { IsString, IsUUID, Length } from 'class-validator';

export class CreateReportDto {
  @IsUUID()
  jobId: string;

  @IsString()
  @Length(3, 1000)
  reason: string;
}
