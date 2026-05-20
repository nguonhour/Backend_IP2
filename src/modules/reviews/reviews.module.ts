import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployerReview } from './employer-review.entity';
import { ReviewsRepository } from './repository/reviews.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployerReview])],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsRepository],
})
export class ReviewsModule {}
