import { TypeJob } from '../../../entities/master';
export declare class JobSearchDto {
    keyword?: string;
    category?: string;
    location?: string;
    status?: string;
    blocked?: boolean;
    type?: TypeJob;
    minSalary?: number;
    page: number;
    limit: number;
    deadlineSort?: 'asc' | 'desc';
}
