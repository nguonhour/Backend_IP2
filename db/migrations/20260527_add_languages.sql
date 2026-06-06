-- Create master languages table and student_languages join table
CREATE TABLE IF NOT EXISTS m_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  language_id uuid NOT NULL,
  level varchar NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_language_unique ON student_languages (student_id, language_id);

ALTER TABLE student_languages ADD CONSTRAINT IF NOT EXISTS fk_student_profiles_languages FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE;
ALTER TABLE student_languages ADD CONSTRAINT IF NOT EXISTS fk_m_languages FOREIGN KEY (language_id) REFERENCES m_languages(id) ON DELETE CASCADE;

-- Migrate existing JSONB languages from student_profiles into master and join tables
WITH all_langs AS (
  SELECT DISTINCT LOWER((lang->> 'language')::text) AS name
  FROM student_profiles, jsonb_array_elements(coalesce(languages, '[]'::jsonb)) AS lang
  WHERE lang ->> 'language' IS NOT NULL
)
INSERT INTO m_languages (name)
SELECT name FROM all_langs
ON CONFLICT (name) DO NOTHING;

-- Insert student_languages rows
INSERT INTO student_languages (student_id, language_id, level)
SELECT sp.id,
       m.id,
       COALESCE((lang->> 'level')::text, '')
FROM student_profiles sp,
LATERAL jsonb_array_elements(coalesce(sp.languages, '[]'::jsonb)) AS lang
JOIN m_languages m ON LOWER(m.name) = LOWER((lang->> 'language')::text)
ON CONFLICT (student_id, language_id) DO NOTHING;

-- Optionally keep the old jsonb column for compatibility; if desired it can be dropped later after verification.

