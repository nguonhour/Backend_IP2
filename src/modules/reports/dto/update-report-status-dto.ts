import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateReportStatusDto {
    @IsUUID()
    @IsNotEmpty()
    statusId: string;
}