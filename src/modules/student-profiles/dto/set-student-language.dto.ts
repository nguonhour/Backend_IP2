import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class LanguageItem {
  @IsString()
  language: string;

  @IsString()
  level: string;
}

export class SetStudentLanguageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageItem)
  languages: LanguageItem[];
}
