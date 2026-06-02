"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSoftDeleteColumns1672531203000 = void 0;
const typeorm_1 = require("typeorm");
class AddSoftDeleteColumns1672531203000 {
    tables = ['jobs', 'applications', 'payments', 'resumes', 'users'];
    async up(queryRunner) {
        for (const tableName of this.tables) {
            const table = await queryRunner.getTable(tableName);
            if (table && !table.findColumnByName('deleted_at')) {
                await queryRunner.addColumn(tableName, new typeorm_1.TableColumn({
                    name: 'deleted_at',
                    type: 'timestamp',
                    isNullable: true,
                    default: null,
                }));
            }
        }
    }
    async down(queryRunner) {
        for (const tableName of this.tables) {
            const table = await queryRunner.getTable(tableName);
            if (table && table.findColumnByName('deleted_at')) {
                await queryRunner.dropColumn(tableName, 'deleted_at');
            }
        }
    }
}
exports.AddSoftDeleteColumns1672531203000 = AddSoftDeleteColumns1672531203000;
//# sourceMappingURL=1672531203000-AddSoftDeleteColumns.js.map