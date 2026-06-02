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
var IndustriesSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustriesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const master_1 = require("../../../entities/master");
let IndustriesSeeder = IndustriesSeeder_1 = class IndustriesSeeder {
    industryRepository;
    logger = new common_1.Logger(IndustriesSeeder_1.name);
    constructor(industryRepository) {
        this.industryRepository = industryRepository;
    }
    async run() {
        this.logger.log('Seeding industries...');
        const industries = ['Technology', 'Education', 'Healthcare'];
        for (const name of industries) {
            const existing = await this.industryRepository.findOne({
                where: { name },
            });
            if (!existing) {
                await this.industryRepository.save(this.industryRepository.create({ name, isActive: true }));
                this.logger.log(`Seeded industry: ${name}`);
            }
        }
    }
};
exports.IndustriesSeeder = IndustriesSeeder;
exports.IndustriesSeeder = IndustriesSeeder = IndustriesSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(master_1.Industry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IndustriesSeeder);
//# sourceMappingURL=06-industries.seeder.js.map