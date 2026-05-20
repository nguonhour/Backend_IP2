import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    reason: string;

    @IsUUID()
    @IsNotEmpty()
    jobId: string;

    @IsUUID()
    @IsNotEmpty()
    reportTypeId: string;
}