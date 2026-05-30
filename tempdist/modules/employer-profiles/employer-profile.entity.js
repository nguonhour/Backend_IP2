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
exports.EmployerProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const industry_entity_1 = require("../../entities/master/industry.entity");
const job_entity_1 = require("../jobs/job.entity");
const employer_review_entity_1 = require("../reviews/employer-review.entity");
const payment_entity_1 = require("../payments/payment.entity");
let EmployerProfile = class EmployerProfile {
    id;
    user;
    companyName;
    industry;
    location;
    contactEmail;
    avatarUrl;
    about;
    companySize;
    foundedAt;
    website;
    phone;
    currentPlanType;
    jobPostLimit;
    createdAt;
    updatedAt;
    jobs;
    reviews;
    payments;
};
exports.EmployerProfile = EmployerProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], EmployerProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], EmployerProfile.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => industry_entity_1.Industry, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'industry_id' }),
    __metadata("design:type", industry_entity_1.Industry)
], EmployerProfile.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], EmployerProfile.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_email', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], EmployerProfile.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "about", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_size', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "companySize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'founded_at', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "foundedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], EmployerProfile.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'current_plan_type',
        type: 'varchar',
        nullable: true,
        default: 'basic',
    }),
    __metadata("design:type", String)
], EmployerProfile.prototype, "currentPlanType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_post_limit', type: 'int', nullable: true, default: 2 }),
    __metadata("design:type", Number)
], EmployerProfile.prototype, "jobPostLimit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], EmployerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], EmployerProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, (job) => job.employer),
    __metadata("design:type", Array)
], EmployerProfile.prototype, "jobs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employer_review_entity_1.EmployerReview, (review) => review.employer),
    __metadata("design:type", Array)
], EmployerProfile.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.employer),
    __metadata("design:type", Array)
], EmployerProfile.prototype, "payments", void 0);
exports.EmployerProfile = EmployerProfile = __decorate([
    (0, typeorm_1.Entity)('employer_profiles')
], EmployerProfile);
//# sourceMappingURL=employer-profile.entity.js.map