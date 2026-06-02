"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportsTable1672531207000 = void 0;
const typeorm_1 = require("typeorm");
class CreateReportsTable1672531207000 {
    async up(queryRunner) {
        if (await queryRunner.hasTable('reports')) {
            return;
        }
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'reports',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                },
                {
                    name: 'job_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'type',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '50',
                    default: "'OPEN'",
                },
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'admin_notes',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'resolved_by_admin_id',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'resolved_at',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }));
        await queryRunner.createForeignKey('reports', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('reports', new typeorm_1.TableForeignKey({
            columnNames: ['job_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'jobs',
            onDelete: 'SET NULL',
        }));
        await queryRunner.createIndex('reports', new typeorm_1.TableIndex({
            columnNames: ['user_id', 'created_at'],
            name: 'IDX_REPORTS_USER_CREATED',
        }));
        await queryRunner.createIndex('reports', new typeorm_1.TableIndex({
            columnNames: ['job_id', 'status'],
            name: 'IDX_REPORTS_JOB_STATUS',
        }));
        await queryRunner.createIndex('reports', new typeorm_1.TableIndex({
            columnNames: ['status', 'created_at'],
            name: 'IDX_REPORTS_STATUS_CREATED',
        }));
    }
    async down(queryRunner) {
        if (await queryRunner.hasTable('reports')) {
            await queryRunner.dropTable('reports');
        }
    }
}
exports.CreateReportsTable1672531207000 = CreateReportsTable1672531207000;
//# sourceMappingURL=1672531207000-CreateReportsTable.js.map