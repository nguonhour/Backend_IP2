"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_entity_1 = require("./role.entity");
const skill_entity_1 = require("./skill.entity");
const university_entity_1 = require("./university.entity");
const major_entity_1 = require("./major.entity");
const industry_entity_1 = require("./industry.entity");
const job_category_entity_1 = require("./job-category.entity");
const job_type_entity_1 = require("./job-type.entity");
const job_status_entity_1 = require("./job-status.entity");
const application_status_entity_1 = require("./application-status.entity");
const master_controller_1 = require("./master.controller");
const master_service_1 = require("./master.service");
let MasterModule = class MasterModule {
};
exports.MasterModule = MasterModule;
exports.MasterModule = MasterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                role_entity_1.Role,
                skill_entity_1.Skill,
                university_entity_1.University,
                major_entity_1.Major,
                industry_entity_1.Industry,
                job_category_entity_1.JobCategory,
                job_type_entity_1.JobType,
                job_status_entity_1.JobStatus,
                application_status_entity_1.ApplicationStatus,
            ]),
        ],
        controllers: [master_controller_1.MasterController],
        providers: [master_service_1.MasterService],
        exports: [typeorm_1.TypeOrmModule],
    })
], MasterModule);
//# sourceMappingURL=master.module.js.map