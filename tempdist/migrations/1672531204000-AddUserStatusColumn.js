"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserStatusColumn1672531204000 = void 0;
const typeorm_1 = require("typeorm");
class AddUserStatusColumn1672531204000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('users');
        if (table && !table.findColumnByName('status')) {
            await queryRunner.addColumn('users', new typeorm_1.TableColumn({
                name: 'status',
                type: 'varchar',
                default: "'ACTIVE'",
                isNullable: false,
            }));
        }
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('users');
        if (table && table.findColumnByName('status')) {
            await queryRunner.dropColumn('users', 'status');
        }
    }
}
exports.AddUserStatusColumn1672531204000 = AddUserStatusColumn1672531204000;
//# sourceMappingURL=1672531204000-AddUserStatusColumn.js.map