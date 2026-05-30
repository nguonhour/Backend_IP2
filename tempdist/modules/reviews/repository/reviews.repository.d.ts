import { Repository } from 'typeorm';
import { EmployerReview } from '../employer-review.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class ReviewsRepository extends BaseRepository<EmployerReview> {
    protected reviewRepository: Repository<EmployerReview>;
    constructor(reviewRepository: Repository<EmployerReview>);
    findByEmployerId(employerId: string, relations?: string[]): Promise<void | EmployerReview[]>;
    findByStudentId(studentId: string, relations?: string[]): Promise<void | EmployerReview[]>;
    findAverageRating(employerId: string): Promise<any>;
}
