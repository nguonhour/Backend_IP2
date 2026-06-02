"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employer_review_entity_1 = require("../employer-review.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let ReviewsRepository = class ReviewsRepository extends base_repository_1.BaseRepository {
    reviewRepository;
    constructor(reviewRepository) {
        super(reviewRepository);
        this.reviewRepository = reviewRepository;
    }
    async findByEmployerId(employerId, relations) {
        try {
            return await this.reviewRepository.find({
                where: { employer: { id: employerId } },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findByEmployerId', error, { employerId });
        }
    }
    async findByStudentId(studentId, relations) {
        try {
            return await this.reviewRepository.find({
                where: { student: { id: studentId } },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findByStudentId', error, { studentId });
        }
    }
    async findAverageRating(employerId) {
        try {
            const result = await this.reviewRepository
                .createQueryBuilder('review')
                .where('review.employer = :employerId', { employerId })
                .select('AVG(review.rating)', 'avg')
                .getRawOne();
            return result?.avg ?? 0;
        }
        catch (error) {
            return this.handleError('findAverageRating', error, { employerId });
        }
    }
};
exports.ReviewsRepository = ReviewsRepository;
exports.ReviewsRepository = ReviewsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employer_review_entity_1.EmployerReview)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReviewsRepository);
//# sourceMappingURL=reviews.repository.js.map