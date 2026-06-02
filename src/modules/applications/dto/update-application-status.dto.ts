import { IsBoolean, IsObject, IsOptional, IsUUID } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsUUID()
  statusId: string;

  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @IsOptional()
  @IsObject()
  interviewDetails?: {
    date?: string;
    time?: string;
    meetingType?: string;
    meetingLocation?: string;
  };
  // @IsString()
  // statusCode!: string;
}
