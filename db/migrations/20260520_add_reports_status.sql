-- Drop the problematic FK constraint if it exists
ALTER TABLE IF EXISTS reports DROP CONSTRAINT IF EXISTS reports_report_status_id_fkey;

-- Drop the report_status_id column if it exists (this was incorrectly linking to report_status table)
ALTER TABLE IF EXISTS reports DROP COLUMN IF EXISTS report_status_id;

-- Add `status` column as a simple varchar with default 'OPEN'
ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'OPEN';

-- Set status to 'OPEN' for any existing rows without a status
UPDATE reports SET status = 'OPEN' WHERE status IS NULL;
