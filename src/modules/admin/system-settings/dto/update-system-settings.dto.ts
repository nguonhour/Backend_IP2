import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  @IsOptional()
  group?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
