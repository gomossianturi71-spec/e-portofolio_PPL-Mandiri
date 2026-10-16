/*
# Create student_works table — Hasil Pekerjaan Peserta Didik

## Purpose
Adds a new content type to the Produk Praktik Mengajar section.
Each cycle (Siklus 1-4) can have hasil pekerjaan peserta didik entries
that are PDF files, viewable in the built-in PDF reader just like
rancangan pembelajaran documents.

## New Table
- `student_works`
  - `id` (uuid, primary key)
  - `cycle` (int 1-4, which siklus this belongs to)
  - `title` (text, label for the work)
  - `description` (text, short description)
  - `file_path` (text, storage path in teaching-pdfs bucket)
  - `file_name` (text, original file name for display)
  - `is_published` (boolean, draft vs published)
  - `sort_order` (int, for ordering)
  - `created_at`, `updated_at` (timestamps)

## Storage
Reuses the existing `teaching-pdfs` bucket — no new bucket needed.

## Security (RLS)
- Anon: can only read published rows
- Authenticated: can read all rows (including drafts) and perform all CRUD
- Same pattern as teaching_products, teaching_videos, etc.

## Notes
1. No new storage bucket — student work PDFs go in the existing teaching-pdfs bucket.
2. The cycle constraint ensures only Siklus 1-4 are valid.
*/

CREATE TABLE IF NOT EXISTS student_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle int NOT NULL CHECK (cycle IN (1, 2, 3, 4)),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_path text DEFAULT '',
  file_name text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_works ENABLE ROW LEVEL SECURITY;

-- Anon: read only published
DROP POLICY IF EXISTS "anon_read_published_student_works" ON student_works;
CREATE POLICY "anon_read_published_student_works" ON student_works FOR SELECT
  TO anon USING (is_published = true);

-- Authenticated: read all (including drafts)
DROP POLICY IF EXISTS "auth_read_all_student_works" ON student_works;
CREATE POLICY "auth_read_all_student_works" ON student_works FOR SELECT
  TO authenticated USING (true);

-- Authenticated: insert
DROP POLICY IF EXISTS "auth_insert_student_works" ON student_works;
CREATE POLICY "auth_insert_student_works" ON student_works FOR INSERT
  TO authenticated WITH CHECK (true);

-- Authenticated: update
DROP POLICY IF EXISTS "auth_update_student_works" ON student_works;
CREATE POLICY "auth_update_student_works" ON student_works FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Authenticated: delete
DROP POLICY IF EXISTS "auth_delete_student_works" ON student_works;
CREATE POLICY "auth_delete_student_works" ON student_works FOR DELETE
  TO authenticated USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_student_works_cycle ON student_works(cycle);