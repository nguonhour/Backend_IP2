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
  } catch (err) {
    console.error('[InitDB] Error ensuring jobs map columns:', err);
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
