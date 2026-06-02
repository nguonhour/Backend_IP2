"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogsTable1672531202000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAuditLogsTable1672531202000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'audit_logs',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'action',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'module',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'entity_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'entity_type',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'old_data',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'new_data',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'ip_address',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'user_agent',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
            foreignKeys: [
                {
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                },
            ],
            indices: [
                {
                    columnNames: ['user_id'],
                },
                {
                    columnNames: ['action'],
                },
                {
                    columnNames: ['module'],
                },
                {
                    columnNames: ['entity_id'],
                },
                {
                    columnNames: ['created_at'],
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('audit_logs');
    }
}
exports.CreateAuditLogsTable1672531202000 = CreateAuditLogsTable1672531202000;
//# sourceMappingURL=1672531202000-CreateAuditLogsTable.js.map