"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const student_profiles_module_1 = require("./modules/student-profiles/student-profiles.module");
const employer_profiles_module_1 = require("./modules/employer-profiles/employer-profiles.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const applications_module_1 = require("./modules/applications/applications.module");
const resumes_module_1 = require("./modules/resumes/resumes.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const reports_module_1 = require("./modules/reports/reports.module");
const student_company_preferences_module_1 = require("./modules/student-company-preferences/student-company-preferences.module");
const payments_module_1 = require("./modules/payments/payments.module");
const master_module_1 = require("./entities/master/master.module");
const admin_module_1 = require("./modules/admin/admin.module");
const skills_module_1 = require("./modules/skills/skills.module");
const industries_module_1 = require("./modules/industries/industries.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
function requireEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is required`);
    return value;
}
function parseBoolean(value, fallback = false) {
    if (value === undefined)
        return fallback;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        providers: [audit_interceptor_1.AuditInterceptor],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    const databaseUrl = requireEnv('DATABASE_URL').trim();
                    const synchronize = parseBoolean(process.env.DB_SYNC, false);
                    const dropSchema = parseBoolean(process.env.DB_DROP_SCHEMA, false);
                    const isSupabase = databaseUrl.includes('supabase.com');
                    return {
                        type: 'postgres',
                        url: databaseUrl,
                        autoLoadEntities: true,
                        synchronize,
                        dropSchema,
                        ssl: isSupabase ? { rejectUnauthorized: false } : false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            student_profiles_module_1.StudentProfilesModule,
            employer_profiles_module_1.EmployerProfilesModule,
            jobs_module_1.JobsModule,
            applications_module_1.ApplicationsModule,
            resumes_module_1.ResumesModule,
            reviews_module_1.ReviewsModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
            student_company_preferences_module_1.StudentCompanyPreferencesModule,
            payments_module_1.PaymentsModule,
            master_module_1.MasterModule,
            admin_module_1.AdminModule,
            skills_module_1.SkillsModule,
            industries_module_1.IndustriesModule,
            audit_logs_module_1.AuditLogsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map