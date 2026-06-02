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
var ApplicationStatusesSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatusesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_status_entity_1 = require("../../../entities/master/application-status.entity");
let ApplicationStatusesSeeder = ApplicationStatusesSeeder_1 = class ApplicationStatusesSeeder {
    applicationStatusRepository;
    logger = new common_1.Logger(ApplicationStatusesSeeder_1.name);
    constructor(applicationStatusRepository) {
        this.applicationStatusRepository = applicationStatusRepository;
    }
    async run() {
        this.logger.log('Seeding application statuses...');
        const statuses = [
            'Pending',
            'Reviewed',
            'Shortlisted',
            'Interviewing',
            'Offered',
            'Hired',
            'Rejected',
        ];
        for (const name of statuses) {
            const existing = await this.applicationStatusRepository.findOne({
                where: { name },
            });
            if (!existing) {
                await this.applicationStatusRepository.save(this.applicationStatusRepository.create({ name, isActive: true }));
                this.logger.log(`Seeded application status: ${name}`);
            }
        }
    }
};
exports.ApplicationStatusesSeeder = ApplicationStatusesSeeder;
exports.ApplicationStatusesSeeder = ApplicationStatusesSeeder = ApplicationStatusesSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_status_entity_1.ApplicationStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApplicationStatusesSeeder);
//# sourceMappingURL=09-application-statuses.seeder.js.map