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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerReview = void 0;
const typeorm_1 = require("typeorm");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
let EmployerReview = class EmployerReview {
    id;
    student;
    employer;
    rating;
    reviewText;
    createdAt;
};
exports.EmployerReview = EmployerReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployerReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], EmployerReview.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employer_profile_entity_1.EmployerProfile, (employer) => employer.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'employer_id' }),
    __metadata("design:type", employer_profile_entity_1.EmployerProfile)
], EmployerReview.prototype, "employer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], EmployerReview.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployerReview.prototype, "reviewText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], EmployerReview.prototype, "createdAt", void 0);
exports.EmployerReview = EmployerReview = __decorate([
    (0, typeorm_1.Entity)('employer_reviews')
], EmployerReview);
//# sourceMappingURL=employer-review.entity.js.map