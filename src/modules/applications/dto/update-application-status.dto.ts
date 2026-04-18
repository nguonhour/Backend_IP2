import { IsUUID } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsUUID()
  statusId: string;
}
