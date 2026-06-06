import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddJobApprovalFields1672531205000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('jobs');

    if (table && !table.findColumnByName('approval_status')) {
      await queryRunner.addColumn(
        'jobs',
        new TableColumn({
          name: 'approval_status',
          type: 'varchar',
          default: "'PENDING_APPROVAL'",
          isNullable: false,
        }),
      );
    }

    if (table && !table.findColumnByName('rejection_reason')) {
      await queryRunner.addColumn(
        'jobs',
        new TableColumn({
          name: 'rejection_reason',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('jobs');

    if (table && table.findColumnByName('rejection_reason')) {
      await queryRunner.dropColumn('jobs', 'rejection_reason');
    }

    if (table && table.findColumnByName('approval_status')) {
      await queryRunner.dropColumn('jobs', 'approval_status');
    }
  }
}
