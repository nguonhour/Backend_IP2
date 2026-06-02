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
exports.PaymentsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../payment.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let PaymentsRepository = class PaymentsRepository extends base_repository_1.BaseRepository {
    paymentRepository;
    constructor(paymentRepository) {
        super(paymentRepository);
        this.paymentRepository = paymentRepository;
    }
    async findByEmployerId(employerId, relations) {
        try {
            return await this.paymentRepository.find({
                where: { employer: { id: employerId } },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findByEmployerId', error, { employerId });
        }
    }
    async findByStatus(status, relations) {
        try {
            return await this.paymentRepository.find({
                where: { status },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByStatus', error, { status });
        }
    }
    async findByTransactionRef(transactionRef) {
        try {
            return await this.paymentRepository.findOne({
                where: { transactionRef },
            });
        }
        catch (error) {
            return this.handleError('findByTransactionRef', error, {
                transactionRef,
            });
        }
    }
};
exports.PaymentsRepository = PaymentsRepository;
exports.PaymentsRepository = PaymentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentsRepository);
//# sourceMappingURL=payments.repository.js.map