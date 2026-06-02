"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const employer_profiles_controller_1 = require("./employer-profiles.controller");
const employer_profiles_service_1 = require("./employer-profiles.service");
const employer_profile_entity_1 = require("./employer-profile.entity");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/user.entity");
const industry_entity_1 = require("../../entities/master/industry.entity");
const employer_profiles_repository_1 = require("./repository/employer-profiles.repository");
const job_category_entity_1 = require("../../entities/master/job-category.entity");
let EmployerProfilesModule = class EmployerProfilesModule {
};
exports.EmployerProfilesModule = EmployerProfilesModule;
exports.EmployerProfilesModule = EmployerProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([employer_profile_entity_1.EmployerProfile, user_entity_1.User, industry_entity_1.Industry, job_category_entity_1.JobCategory]),
        ],
        controllers: [employer_profiles_controller_1.EmployerProfilesController],
        providers: [employer_profiles_service_1.EmployerProfilesService, employer_profiles_repository_1.EmployerProfilesRepository],
        exports: [employer_profiles_repository_1.EmployerProfilesRepository],
    })
], EmployerProfilesModule);
//# sourceMappingURL=employer-profiles.module.js.map