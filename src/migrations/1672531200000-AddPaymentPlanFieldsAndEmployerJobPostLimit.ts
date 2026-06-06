import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000 implements MigrationInterface {
  name = 'AddPaymentPlanFieldsAndEmployerJobPostLimit1672531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to payments table
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'plan_type',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'job_post_limit',
        type: 'int',
        isNullable: true,
        default: 2,
      }),
    );

    // Add columns to employer_profiles table
    await queryRunner.addColumn(
      'employer_profiles',
      new TableColumn({
        name: 'current_plan_type',
        type: 'varchar',
        isNullable: true,
        default: "'basic'",
      }),
    );

    await queryRunner.addColumn(
      'employer_profiles',
      new TableColumn({
        name: 'job_post_limit',
        type: 'int',
        isNullable: true,
        default: 2,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from employer_profiles table
    await queryRunner.dropColumn('employer_profiles', 'job_post_limit');
    await queryRunner.dropColumn('employer_profiles', 'current_plan_type');

    // Remove columns from payments table
    await queryRunner.dropColumn('payments', 'job_post_limit');
    await queryRunner.dropColumn('payments', 'plan_type');
  }
}
