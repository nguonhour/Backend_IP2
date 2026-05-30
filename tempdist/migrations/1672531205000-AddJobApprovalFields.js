"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddJobApprovalFields1672531205000 = void 0;
const typeorm_1 = require("typeorm");
class AddJobApprovalFields1672531205000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('jobs');
        if (table && !table.findColumnByName('approval_status')) {
            await queryRunner.addColumn('jobs', new typeorm_1.TableColumn({
                name: 'approval_status',
                type: 'varchar',
                default: "'PENDING_APPROVAL'",
                isNullable: false,
            }));
        }
        if (table && !table.findColumnByName('rejection_reason')) {
            await queryRunner.addColumn('jobs', new typeorm_1.TableColumn({
                name: 'rejection_reason',
                type: 'text',
                isNullable: true,
            }));
        }
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('jobs');
        if (table && table.findColumnByName('rejection_reason')) {
            await queryRunner.dropColumn('jobs', 'rejection_reason');
        }
        if (table && table.findColumnByName('approval_status')) {
            await queryRunner.dropColumn('jobs', 'approval_status');
        }
    }
}
exports.AddJobApprovalFields1672531205000 = AddJobApprovalFields1672531205000;
//# sourceMappingURL=1672531205000-AddJobApprovalFields.js.map