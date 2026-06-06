import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnblockApprovedJobs1672531210000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE jobs
      SET is_blocked = false
      WHERE approval_status = 'APPROVED'
        AND is_blocked IS TRUE
    `);
  }

  public async down(): Promise<void> {
    // Public visibility normalization is intentionally not reversed.
  }
}
