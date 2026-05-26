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

  try {
    await dataSource.query(
      `ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS about text`,
    );
    await dataSource.query(
      `ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS company_size varchar`,
    );
    await dataSource.query(
      `ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS founded_at date`,
    );
    await dataSource.query(
      `ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS website varchar`,
    );
    await dataSource.query(
      `ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS phone varchar`,
    );
    console.log('[InitDB] Ensured extended employer profile columns exist');
  } catch (err) {
    console.error('[InitDB] Error ensuring employer profile columns:', err);
  }

  try {
    await dataSource.query(
      `ALTER TABLE m_job_categories ADD COLUMN IF NOT EXISTS employer_id uuid`,
    );
    await dataSource.query(
      `ALTER TABLE m_job_categories DROP CONSTRAINT IF EXISTS "UQ_m_job_categories_name"`,
    );
    await dataSource.query(`
      DO $$
      DECLARE constraint_name text;
      BEGIN
        SELECT tc.constraint_name INTO constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_name = kcu.table_name
        WHERE tc.table_name = 'm_job_categories'
          AND tc.constraint_type = 'UNIQUE'
          AND kcu.column_name = 'name'
        LIMIT 1;

        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE m_job_categories DROP CONSTRAINT %I', constraint_name);
        END IF;
      END $$;
    `);
    await dataSource.query(
      `DROP INDEX IF EXISTS "IDX_m_job_categories_name"`,
    );
    await dataSource.query(
      `ALTER TABLE m_job_categories
       ADD CONSTRAINT "FK_m_job_categories_employer"
       FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE`,
    ).catch(() => undefined);
    console.log('[InitDB] Ensured employer-owned job categories are supported');
  } catch (err) {
    console.error('[InitDB] Error ensuring employer category columns:', err);
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
  
  // Fix reports foreign key constraint:
  // when a job is deleted, keep reports and set job_id to NULL
  try {
    await dataSource.query(`
      ALTER TABLE reports
      DROP CONSTRAINT IF EXISTS "FK_494740ea1dba7c7c018bc6b2e2a"
    `);

    await dataSource.query(`
      ALTER TABLE reports
      ADD CONSTRAINT "FK_494740ea1dba7c7c018bc6b2e2a"
      FOREIGN KEY (job_id)
      REFERENCES jobs(id)
      ON DELETE SET NULL
    `);

    console.log('[InitDB] Updated reports.job_id FK to SET NULL');
  } catch (err) {
    console.error('[InitDB] Error updating reports FK:', err);
  }
  // rename referenceId to reference_id in notifications table
  try {
    await dataSource.query(`
      ALTER TABLE notifications RENAME COLUMN "referenceId" TO reference_id
    `);
    console.log('[InitDB] Renamed referenceId to reference_id in notifications table');
  } catch (err) {
    console.error('[InitDB] Error renaming column in notifications table:', err);
  }

  //rename isRead to is_read in notifications table
  try {
    await dataSource.query(`
      ALTER TABLE notifications RENAME COLUMN "isRead" TO is_read
    `);
    console.log('[InitDB] Renamed isRead to is_read in notifications table');
  } catch (err) {
    console.error('[InitDB] Error renaming column in notifications table:', err);
  }
  // rename createdAt to created_at in notifications table
  try {
    await dataSource.query(`
      ALTER TABLE notifications RENAME COLUMN "createdAt" TO created_at
    `);
    console.log('[InitDB] Renamed createdAt to created_at in notifications table');
  } catch (err) {
    console.error('[InitDB] Error renaming column in notifications table:', err);
  }
}
