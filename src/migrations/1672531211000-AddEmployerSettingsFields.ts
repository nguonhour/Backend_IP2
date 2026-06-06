import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployerSettingsFields1672531211000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE employer_profiles
      ADD COLUMN IF NOT EXISTS applicant_digest_enabled boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS billing_alerts_enabled boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS marketing_updates_enabled boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS profile_visibility_enabled boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE employer_profiles
      DROP COLUMN IF EXISTS profile_visibility_enabled,
      DROP COLUMN IF EXISTS marketing_updates_enabled,
      DROP COLUMN IF EXISTS billing_alerts_enabled,
      DROP COLUMN IF EXISTS applicant_digest_enabled
    `);
  }
}
