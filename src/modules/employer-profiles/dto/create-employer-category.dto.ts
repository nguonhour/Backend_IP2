import { IsString, MaxLength } from 'class-validator';

export class CreateEmployerCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
