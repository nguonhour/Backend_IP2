import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAdditionalApplicationStatuses1672531208000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
