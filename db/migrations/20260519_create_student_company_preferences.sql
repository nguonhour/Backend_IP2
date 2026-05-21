-- Create student_company_preferences table
CREATE TABLE IF NOT EXISTS student_company_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  employer_id uuid NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  muted boolean NOT NULL DEFAULT false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

ALTER TABLE student_company_preferences
  ADD CONSTRAINT uq_student_employer UNIQUE (student_id, employer_id);

-- Foreign keys (ensure referenced tables exist)
ALTER TABLE student_company_preferences
  ADD CONSTRAINT fk_pref_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE;

ALTER TABLE student_company_preferences
  ADD CONSTRAINT fk_pref_employer FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE;
