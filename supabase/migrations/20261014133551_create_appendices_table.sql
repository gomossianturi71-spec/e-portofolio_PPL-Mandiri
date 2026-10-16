/*
# Create appendices table for Lampiran 7 and 8

## Purpose
Stores PDF documents for Lampiran 7 and Lampiran 8 across Siklus 1-4.
Each slot is uniquely identified by (cycle, appendix_number) where:
- cycle: 1, 2, 3, or 4
- appendix_number: 7 or 8

This creates 8 fixed slots (4 cycles x 2 appendices).

## New Table
- **appendices**
  - id (uuid, primary key)
  - cycle (int, 1-4, not null)
  - appendix_number (int, 7 or 8, not null)
  - title (text, not null, default '') — e.g. "Lampiran 7 Siklus 1"
  - description (text, not null, default '') — description of the assessment document
  - file_path (text, default '') — storage path
  - file_name (text, default '') — original file name
  - is_published (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - Unique constraint on (cycle, appendix_number) to ensure one row per slot

## Security (RLS)
- Anon: can only read published rows
- Authenticated: can read all rows (including drafts), and insert/update/delete

## Storage
- Uses existing `teaching-pdfs` bucket (already has public read + authenticated write policies)
- No new bucket needed

## Notes
1. The unique constraint on (cycle, appendix_number) ensures exactly one file per slot.
2. The admin UI will use upsert or insert-or-update to manage each slot.
3. No data migration needed — slots start empty and are filled by the admin.
*/

CREATE TABLE IF NOT EXISTS appendices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle int NOT NULL CHECK (cycle IN (1, 2, 3, 4)),
  appendix_number int NOT NULL CHECK (appendix_number IN (7, 8)),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_path text DEFAULT '',
  file_name text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure one row per (cycle, appendix_number) slot
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appendices_cycle_appendix_unique') THEN
    ALTER TABLE appendices ADD CONSTRAINT appendices_cycle_appendix_unique UNIQUE (cycle, appendix_number);
  END IF;
END $$;

ALTER TABLE appendices ENABLE ROW LEVEL SECURITY;

-- Anon: read published only
DROP POLICY IF EXISTS "anon_read_published_appendices" ON appendices;
CREATE POLICY "anon_read_published_appendices" ON appendices FOR SELECT
  TO anon USING (is_published = true);

-- Authenticated: read all (including drafts)
DROP POLICY IF EXISTS "auth_read_all_appendices" ON appendices;
CREATE POLICY "auth_read_all_appendices" ON appendices FOR SELECT
  TO authenticated USING (true);

-- Authenticated: insert
DROP POLICY IF EXISTS "auth_insert_appendices" ON appendices;
CREATE POLICY "auth_insert_appendices" ON appendices FOR INSERT
  TO authenticated WITH CHECK (true);

-- Authenticated: update
DROP POLICY IF EXISTS "auth_update_appendices" ON appendices;
CREATE POLICY "auth_update_appendices" ON appendices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Authenticated: delete
DROP POLICY IF EXISTS "auth_delete_appendices" ON appendices;
CREATE POLICY "auth_delete_appendices" ON appendices FOR DELETE
  TO authenticated USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_appendices_cycle_appendix ON appendices(cycle, appendix_number);
