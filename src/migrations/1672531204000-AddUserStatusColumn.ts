import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserStatusColumn1672531204000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    if (table && !table.findColumnByName('status')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'status',
          type: 'varchar',
          default: "'ACTIVE'",
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    if (table && table.findColumnByName('status')) {
      await queryRunner.dropColumn('users', 'status');
    }
  }
}
