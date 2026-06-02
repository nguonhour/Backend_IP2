"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStudentCompanyPreferences1672531201000 = void 0;
class CreateStudentCompanyPreferences1672531201000 {
    name = 'CreateStudentCompanyPreferences1672531201000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "student_company_preferences" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "student_id" uuid NOT NULL,
      "employer_id" uuid NOT NULL,
      "blocked" boolean DEFAULT false,
      "muted" boolean DEFAULT false,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    );`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_student_employer_unique" ON "student_company_preferences" ("student_id","employer_id");`);
        await queryRunner.query(`ALTER TABLE "student_company_preferences" ADD CONSTRAINT "fk_student_profiles" FOREIGN KEY ("student_id") REFERENCES "student_profiles" ("id") ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "student_company_preferences" ADD CONSTRAINT "fk_employer_profiles" FOREIGN KEY ("employer_id") REFERENCES "employer_profiles" ("id") ON DELETE CASCADE;`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "student_company_preferences" DROP CONSTRAINT IF EXISTS "fk_student_profiles";`);
        await queryRunner.query(`ALTER TABLE "student_company_preferences" DROP CONSTRAINT IF EXISTS "fk_employer_profiles";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_student_employer_unique";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "student_company_preferences";`);
    }
}
exports.CreateStudentCompanyPreferences1672531201000 = CreateStudentCompanyPreferences1672531201000;
//# sourceMappingURL=1672531201000-CreateStudentCompanyPreferences.js.map