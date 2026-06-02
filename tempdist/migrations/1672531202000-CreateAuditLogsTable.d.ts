import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateAuditLogsTable1672531202000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
