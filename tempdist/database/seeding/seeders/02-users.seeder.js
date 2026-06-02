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
var UsersSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../../modules/users/user.entity");
const master_1 = require("../../../entities/master");
let UsersSeeder = UsersSeeder_1 = class UsersSeeder {
    userRepository;
    roleRepository;
    logger = new common_1.Logger(UsersSeeder_1.name);
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async run() {
        this.logger.log('Seeding Users...');
        const adminRole = await this.roleRepository.findOne({
            where: { name: 'ADMIN' },
        });
        const employerRole = await this.roleRepository.findOne({
            where: { name: 'EMPLOYER' },
        });
        const studentRole = await this.roleRepository.findOne({
            where: { name: 'STUDENT' },
        });
        if (!adminRole) {
            throw new Error('Admin role not found! Did you run the Roles seeder first?');
        }
        if (!employerRole) {
            throw new Error('Employer role not found! Did you run the Roles seeder first?');
        }
        if (!studentRole) {
            throw new Error('Student role not found! Did you run the Roles seeder first?');
        }
        const adminEmail = 'admin@yourplatform.com';
        const employerEmail = 'employer1@gmail.com';
        const studentEmail = 'student1@gmail.com';
        const existingAdmin = await this.userRepository.findOne({
            where: { email: adminEmail },
        });
        const existingEmployer = await this.userRepository.findOne({
            where: { email: employerEmail },
        });
        const existingStudent = await this.userRepository.findOne({
            where: { email: studentEmail },
        });
        if (!existingAdmin) {
            const adminUser = this.userRepository.create({
                email: adminEmail,
                passwordHash: this.hashPassword('Password123!'),
                role: adminRole,
            });
            await this.userRepository.save(adminUser);
            this.logger.log(`Created admin user: ${adminEmail}`);
        }
        else {
            this.logger.debug(`Admin user already exists. Skipping.`);
        }
        if (!existingEmployer) {
            const employerUser = this.userRepository.create({
                email: employerEmail,
                passwordHash: this.hashPassword('Password123!'),
                role: employerRole,
            });
            await this.userRepository.save(employerUser);
            this.logger.log(`Created employer user: ${employerEmail}`);
        }
        else {
            this.logger.debug(`Employer user already exists. Skipping.`);
        }
        if (!existingStudent) {
            const studentUser = this.userRepository.create({
                email: studentEmail,
                passwordHash: this.hashPassword('Password123!'),
                role: studentRole,
            });
            await this.userRepository.save(studentUser);
            this.logger.log(`Created student user: ${studentEmail}`);
        }
        else {
            this.logger.debug(`Student user already exists. Skipping.`);
        }
    }
    hashPassword(password) {
        return (0, crypto_1.createHash)('sha256').update(password).digest('hex');
    }
};
exports.UsersSeeder = UsersSeeder;
exports.UsersSeeder = UsersSeeder = UsersSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(master_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersSeeder);
//# sourceMappingURL=02-users.seeder.js.map