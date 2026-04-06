import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployerReview } from './employer-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployerReview])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
