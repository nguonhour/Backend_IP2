import { IsUUID } from 'class-validator';

export class UpdateJobStatusDto {
  @IsUUID()
  statusId: string;
}
