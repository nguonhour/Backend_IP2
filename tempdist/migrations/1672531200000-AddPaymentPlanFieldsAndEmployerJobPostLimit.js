"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000 = void 0;
const typeorm_1 = require("typeorm");
class AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000 {
    name = 'AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000';
    async up(queryRunner) {
        await queryRunner.addColumn('payments', new typeorm_1.TableColumn({
            name: 'plan_type',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn('payments', new typeorm_1.TableColumn({
            name: 'job_post_limit',
            type: 'int',
            isNullable: true,
            default: 2,
        }));
        await queryRunner.addColumn('employer_profiles', new typeorm_1.TableColumn({
            name: 'current_plan_type',
            type: 'varchar',
            isNullable: true,
            default: "'basic'",
        }));
        await queryRunner.addColumn('employer_profiles', new typeorm_1.TableColumn({
            name: 'job_post_limit',
            type: 'int',
            isNullable: true,
            default: 2,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('employer_profiles', 'job_post_limit');
        await queryRunner.dropColumn('employer_profiles', 'current_plan_type');
        await queryRunner.dropColumn('payments', 'job_post_limit');
        await queryRunner.dropColumn('payments', 'plan_type');
    }
}
exports.AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000 = AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000;
//# sourceMappingURL=1672531200000-AddPaymentPlanFieldsAndEmployerJobPostLimit.js.map