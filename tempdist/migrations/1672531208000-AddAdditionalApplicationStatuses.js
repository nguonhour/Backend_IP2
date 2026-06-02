"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAdditionalApplicationStatuses1672531208000 = void 0;
class AddAdditionalApplicationStatuses1672531208000 {
    name = 'AddAdditionalApplicationStatuses1672531208000';
    async up(queryRunner) {
        await queryRunner.query(`
      INSERT INTO "m_application_status" ("name", "is_active")
      VALUES
        ('Shortlisted', true),
        ('Hired', true)
      ON CONFLICT ("name") DO UPDATE
      SET "is_active" = EXCLUDED."is_active"
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DELETE FROM "m_application_status"
      WHERE "name" IN ('Shortlisted', 'Hired')
    `);
    }
}
exports.AddAdditionalApplicationStatuses1672531208000 = AddAdditionalApplicationStatuses1672531208000;
//# sourceMappingURL=1672531208000-AddAdditionalApplicationStatuses.js.map