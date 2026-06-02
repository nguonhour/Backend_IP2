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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const payment_status_enum_1 = require("./enum/payment-status.enum");
let Payment = class Payment {
    id;
    employer;
    amount;
    currency;
    status;
    paymentMethod;
    transactionRef;
    planName;
    planType;
    jobPostLimit;
    expiresAt;
    createdAt;
    updatedAt;
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employer_profile_entity_1.EmployerProfile, (employer) => employer.payments),
    (0, typeorm_1.JoinColumn)({ name: 'employer_id' }),
    __metadata("design:type", employer_profile_entity_1.EmployerProfile)
], Payment.prototype, "employer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: payment_status_enum_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_ref', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "transactionRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_name', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "planName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_type', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "planType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_post_limit', nullable: true, type: 'int', default: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "jobPostLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map