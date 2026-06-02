"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_profiles_controller_1 = require("./student-profiles.controller");
const student_profiles_service_1 = require("./student-profiles.service");
const student_profile_entity_1 = require("./student-profile.entity");
const search_history_entity_1 = require("./search-history.entity");
const student_skill_entity_1 = require("./student-skill.entity");
const student_industry_entity_1 = require("./student-industry.entity");
const saved_job_entity_1 = require("../jobs/saved-job.entity");
const job_entity_1 = require("../jobs/job.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const university_entity_1 = require("../../entities/master/university.entity");
const major_entity_1 = require("../../entities/master/major.entity");
const user_entity_1 = require("../users/user.entity");
const skill_entity_1 = require("../../entities/master/skill.entity");
const industry_entity_1 = require("../../entities/master/industry.entity");
const student_profiles_repository_1 = require("./repository/student-profiles.repository");
let StudentProfilesModule = class StudentProfilesModule {
};
exports.StudentProfilesModule = StudentProfilesModule;
exports.StudentProfilesModule = StudentProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                student_profile_entity_1.StudentProfile,
                search_history_entity_1.SearchHistory,
                student_skill_entity_1.StudentSkill,
                student_industry_entity_1.StudentIndustry,
                saved_job_entity_1.SavedJob,
                job_entity_1.Job,
                resume_entity_1.Resume,
                university_entity_1.University,
                major_entity_1.Major,
                user_entity_1.User,
                skill_entity_1.Skill,
                industry_entity_1.Industry,
            ]),
        ],
        controllers: [student_profiles_controller_1.StudentProfilesController],
        providers: [student_profiles_service_1.StudentProfilesService, student_profiles_repository_1.StudentProfilesRepository],
        exports: [student_profiles_repository_1.StudentProfilesRepository],
    })
], StudentProfilesModule);
//# sourceMappingURL=student-profiles.module.js.map