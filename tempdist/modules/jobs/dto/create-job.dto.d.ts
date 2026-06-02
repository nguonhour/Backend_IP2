export declare class CreateJobDto {
    title: string;
    description: string;
    summary?: string;
    benefits?: string;
    imageUrl?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    deadline?: string;
    categoryId?: string;
    jobTypeId?: string;
    statusId?: string;
    employerId?: string;
    numberOfOpenings: number;
}
