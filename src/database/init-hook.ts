import { DataSource } from 'typeorm';

export async function initializeDatabase(dataSource: DataSource) {
  try {
    await dataSource.query(
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude numeric(10, 7)`,
    );
    await dataSource.query(
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude numeric(10, 7)`,
    );
    console.log('[InitDB] Ensured latitude/longitude columns exist on jobs');
    await dataSource.query(
      `ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method varchar`,
    );
    await dataSource.query(
      `ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_ref varchar`,
    );
    await dataSource.query(
      `ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_name varchar`,
    );
    await dataSource.query(
      `ALTER TABLE payments ADD COLUMN IF NOT EXISTS expires_at timestamp`,
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_transaction_ref" ON payments (transaction_ref)`,
    );
    console.log('[InitDB] Ensured payment checkout columns exist on payments');
  } catch (err) {
    console.error('[InitDB] Error ensuring payment checkout columns:', err);
  }

  try {
    await dataSource.query(
      `ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS external_user_id varchar`,
    );
    await dataSource.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_student_profiles_external_user_id" ON student_profiles (external_user_id)`,
    );
    console.log(
      '[InitDB] Ensured external_user_id column exists on student_profiles',
    );
  } catch (err) {
    console.error('[InitDB] Error ensuring external_user_id column:', err);
  }

  // try {
  //   await dataSource.query(
  //     `ALTER TABLE m_skills ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`,
  //   );
  //   await dataSource.query(
  //     `ALTER TABLE m_skills ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP`,
  //   );
  //   console.log('[InitDB] Ensured is_active column exists on m_skills');
  // } catch (err) {
  //   console.error('[InitDB] Error ensuring is_active column on m_skills:', err);
  // }

  try {
    await dataSource.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash varchar`,
    );
    await dataSource.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at timestamp`,
    );
    console.log('[InitDB] Ensured email verification columns exist on users');
  } catch (err) {
    console.error('[InitDB] Error ensuring email verification columns:', err);
  }

  try {
    // Drop the bad FK constraint on resumes table that points to users instead of student_profiles
    await dataSource.query(
      `ALTER TABLE resumes DROP CONSTRAINT IF EXISTS "FK_dce6e1ce26d348e602f56fa6363"`,
    );
    console.log('[InitDB] Dropped bad FK constraint on resumes');
  } catch (err) {
    console.error('[InitDB] Error dropping FK constraint:', err);
  }

  try {
    // Check if the constraint exists before trying to recreate
    const result = await dataSource.query(
      `SELECT COUNT(*) FROM information_schema.table_constraints 
       WHERE table_name = 'resumes' AND constraint_name = 'FK_student_profile'`,
    );

    if (result[0].count === 0) {
      // Recreate the constraint correctly
      await dataSource.query(
        `ALTER TABLE resumes 
         ADD CONSTRAINT "FK_student_profile" 
         FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE`,
      );
      console.log('[InitDB] Created correct FK constraint on resumes');
    }
  } catch (err) {
    console.error('[InitDB] Error creating FK constraint:', err);
    // Continue anyway - the constraint might already exist or be unnecessary
  }
}
