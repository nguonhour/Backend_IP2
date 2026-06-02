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
var RolesSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const master_1 = require("../../../entities/master");
let RolesSeeder = RolesSeeder_1 = class RolesSeeder {
    roleRepository;
    logger = new common_1.Logger(RolesSeeder_1.name);
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async run() {
        this.logger.log('Seeding roles...');
        const rolesToSeed = [
            { name: 'ADMIN' },
            { name: 'EMPLOYER' },
            { name: 'STUDENT' },
        ];
        for (const roleData of rolesToSeed) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleData.name },
            });
            if (!existingRole) {
                const role = this.roleRepository.create(roleData);
                await this.roleRepository.save(role);
                this.logger.log(`Seeded role: ${roleData.name}`);
            }
            else {
                this.logger.debug(`Role ${roleData.name} already exists. Skipping.`);
            }
        }
    }
};
exports.RolesSeeder = RolesSeeder;
exports.RolesSeeder = RolesSeeder = RolesSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(master_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesSeeder);
//# sourceMappingURL=01-roles.seeder.js.map