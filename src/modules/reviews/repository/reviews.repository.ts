import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerReview } from '../employer-review.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ReviewsRepository extends BaseRepository<EmployerReview> {
  protected reviewRepository: Repository<EmployerReview>;
  constructor(
    @InjectRepository(EmployerReview)
    reviewRepository: Repository<EmployerReview>,
  ) {
    super(reviewRepository);
    this.reviewRepository = reviewRepository;
  }

  async findByEmployerId(employerId: string, relations?: string[]) {
    try {
      return await this.reviewRepository.find({
        where: { employer: { id: employerId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByEmployerId', error, { employerId });
    }
  }

  async findByStudentId(studentId: string, relations?: string[]) {
    try {
      return await this.reviewRepository.find({
        where: { student: { id: studentId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByStudentId', error, { studentId });
    }
  }

  async findAverageRating(employerId: string) {
    try {
      const result = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.employer = :employerId', { employerId })
        .select('AVG(review.rating)', 'avg')
        .getRawOne();
      return result?.avg ?? 0;
    } catch (error) {
      return this.handleError('findAverageRating', error, { employerId });
    }
  }
}
