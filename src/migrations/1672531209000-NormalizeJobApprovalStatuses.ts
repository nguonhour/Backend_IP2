import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeJobApprovalStatuses1672531209000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE jobs
      SET approval_status = 'APPROVED'
      WHERE UPPER(approval_status) IN ('APPROVAL', 'APPROVED')
        AND approval_status <> 'APPROVED'
    `);
  }

  public async down(): Promise<void> {
    // Data normalization is intentionally not reversed.
  }
}
