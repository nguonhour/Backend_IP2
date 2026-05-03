import { IsString, IsUUID } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsUUID()
  statusId: string;
  @IsString()
  statusCode!: string 
}
