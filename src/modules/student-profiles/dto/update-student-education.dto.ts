import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UpdateStudentEducationDto{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsOptional()
    @IsString()
    educationLevel?: string

    @IsOptional()
    @IsString()
    fieldOfStudy?: string;

    @IsOptional()
    @IsString()
    institutionName?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;
}