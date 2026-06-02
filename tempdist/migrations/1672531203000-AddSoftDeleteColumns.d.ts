import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSoftDeleteColumns1672531203000 implements MigrationInterface {
    private tables;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
