import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @IsString()
  message: string;
}