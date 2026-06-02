import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateStudentCompanyPreferences1672531201000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
