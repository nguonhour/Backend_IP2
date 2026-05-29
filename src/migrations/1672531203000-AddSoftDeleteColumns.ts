import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteColumns1672531203000 implements MigrationInterface {
  private tables = ['jobs', 'applications', 'payments', 'resumes', 'users'];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of this.tables) {
      // Check if column already exists
      const table = await queryRunner.getTable(tableName);
      if (table && !table.findColumnByName('deleted_at')) {
        await queryRunner.addColumn(
          tableName,
          new TableColumn({
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            default: null,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of this.tables) {
      const table = await queryRunner.getTable(tableName);
      if (table && table.findColumnByName('deleted_at')) {
        await queryRunner.dropColumn(tableName, 'deleted_at');
      }
    }
  }
}
