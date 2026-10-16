/*
# E-Portofolio PPL Mandiri — Database Schema

This migration creates the complete database schema for the E-Portofolio PPL Mandiri PPG Prajabatan PJOK website.

## Tables Created

1. **profile** — Single-row table storing owner profile (name, school, year, intro, visions, profile photo path)
2. **teaching_products** — Rancangan pembelajaran (PDF documents) per cycle (Siklus 1-4)
3. **teaching_videos** — Video praktik mengajar links per cycle
4. **analyses** — Six types of analysis content (rancangan, materi, media, video, nonmengajar, instrumen)
5. **documentation** — Photo gallery entries with title, description, image path, and sort order

## Storage Buckets

- **profile-photos** — for profile picture uploads
- **teaching-pdfs** — for PDF rancangan pembelajaran files
- **documentation-photos** — for documentation gallery images

## Security (RLS)

All tables have RLS enabled.
- Public read access (anon + authenticated) for published content
- Write/update/delete restricted to authenticated users only (admin/owner)
- Storage buckets have public read, authenticated write policies

## Notes

1. The profile table is designed as a single-row table (enforced by a unique index on a constant).
2. Each teaching product and video has a cycle number (1-4) and an is_selected flag for marking the best product.
3. Each analysis has a type field distinguishing the six analysis components.
4. Documentation photos have a sort_order field for reordering.
5. A published flag on each content type allows draft vs published content separation.
*/

-- ============================================
-- TABLE: profile
-- ============================================
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL DEFAULT 'Gomos Andreas Sianturi',
  program text NOT NULL DEFAULT 'PPG Prajabatan',
  field_of_study text NOT NULL DEFAULT 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  year text NOT NULL DEFAULT '2026',
  school_name text DEFAULT '',
  intro_text text NOT NULL DEFAULT 'Saya merupakan calon guru PJOK yang ingin terus mengembangkan kemampuan dalam merancang, melaksanakan, dan mengevaluasi pembelajaran yang sesuai dengan kebutuhan peserta didik. Melalui kegiatan PPL Mandiri, saya berupaya menghubungkan teori yang dipelajari selama pendidikan profesi dengan pengalaman praktik di sekolah serta melakukan refleksi untuk memperbaiki kualitas pembelajaran.',
  vision_education text NOT NULL DEFAULT 'Mewujudkan pendidikan Indonesia yang adaptif terhadap perkembangan teknologi dan berpusat pada peserta didik.',
  vision_education_desc text NOT NULL DEFAULT 'Saya meyakini bahwa teknologi dapat menjadi sarana pendukung untuk membantu guru merancang pembelajaran, menyampaikan materi, melaksanakan asesmen, dan memberikan umpan balik. Pemanfaatannya perlu disesuaikan dengan kebutuhan peserta didik dan tidak menggantikan peran guru.',
  vision_teacher text NOT NULL DEFAULT 'Menjadi guru yang adaptif, inovatif, dan melek teknologi serta mampu memanfaatkan teknologi untuk mendukung pembelajaran yang berpusat pada peserta didik.',
  vision_teacher_desc text DEFAULT '',
  profile_photo_path text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Enforce single row
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profile_single_row_idx') THEN
    CREATE UNIQUE INDEX profile_single_row_idx ON profile ((1));
  END IF;
END $$;

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Profile: public read, authenticated write
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_profile" ON profile;
CREATE POLICY "auth_insert_profile" ON profile FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_profile" ON profile;
CREATE POLICY "auth_update_profile" ON profile FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TABLE: teaching_products
-- ============================================
CREATE TABLE IF NOT EXISTS teaching_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle int NOT NULL CHECK (cycle IN (1, 2, 3, 4)),
  title text NOT NULL DEFAULT '',
  material text NOT NULL DEFAULT '',
  doc_type text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_path text DEFAULT '',
  file_name text DEFAULT '',
  is_selected boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teaching_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_teaching_products" ON teaching_products;
CREATE POLICY "public_read_teaching_products" ON teaching_products FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_teaching_products" ON teaching_products;
CREATE POLICY "auth_insert_teaching_products" ON teaching_products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_teaching_products" ON teaching_products;
CREATE POLICY "auth_update_teaching_products" ON teaching_products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_teaching_products" ON teaching_products;
CREATE POLICY "auth_delete_teaching_products" ON teaching_products FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- TABLE: teaching_videos
-- ============================================
CREATE TABLE IF NOT EXISTS teaching_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle int NOT NULL CHECK (cycle IN (1, 2, 3, 4)),
  title text NOT NULL DEFAULT '',
  material text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  is_selected boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teaching_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_teaching_videos" ON teaching_videos;
CREATE POLICY "public_read_teaching_videos" ON teaching_videos FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_teaching_videos" ON teaching_videos;
CREATE POLICY "auth_insert_teaching_videos" ON teaching_videos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_teaching_videos" ON teaching_videos;
CREATE POLICY "auth_update_teaching_videos" ON teaching_videos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_teaching_videos" ON teaching_videos;
CREATE POLICY "auth_delete_teaching_videos" ON teaching_videos FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- TABLE: analyses
-- ============================================
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type text NOT NULL CHECK (analysis_type IN ('rancangan', 'materi', 'media', 'video', 'nonmengajar', 'instrumen')),
  cycle int CHECK (cycle IN (1, 2, 3, 4)),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_path text DEFAULT '',
  file_name text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_analyses" ON analyses;
CREATE POLICY "public_read_analyses" ON analyses FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_analyses" ON analyses;
CREATE POLICY "auth_insert_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_analyses" ON analyses;
CREATE POLICY "auth_update_analyses" ON analyses FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_analyses" ON analyses;
CREATE POLICY "auth_delete_analyses" ON analyses FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- TABLE: documentation
-- ============================================
CREATE TABLE IF NOT EXISTS documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_documentation" ON documentation;
CREATE POLICY "public_read_documentation" ON documentation FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_documentation" ON documentation;
CREATE POLICY "auth_insert_documentation" ON documentation FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_documentation" ON documentation;
CREATE POLICY "auth_update_documentation" ON documentation FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_documentation" ON documentation;
CREATE POLICY "auth_delete_documentation" ON documentation FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('teaching-pdfs', 'teaching-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('documentation-photos', 'documentation-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
CREATE POLICY "public_read_profile_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_write_profile_photos" ON storage.objects;
CREATE POLICY "auth_write_profile_photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_update_profile_photos" ON storage.objects;
CREATE POLICY "auth_update_profile_photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_delete_profile_photos" ON storage.objects;
CREATE POLICY "auth_delete_profile_photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "public_read_teaching_pdfs" ON storage.objects;
CREATE POLICY "public_read_teaching_pdfs" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'teaching-pdfs');

DROP POLICY IF EXISTS "auth_write_teaching_pdfs" ON storage.objects;
CREATE POLICY "auth_write_teaching_pdfs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'teaching-pdfs');

DROP POLICY IF EXISTS "auth_update_teaching_pdfs" ON storage.objects;
CREATE POLICY "auth_update_teaching_pdfs" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'teaching-pdfs');

DROP POLICY IF EXISTS "auth_delete_teaching_pdfs" ON storage.objects;
CREATE POLICY "auth_delete_teaching_pdfs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'teaching-pdfs');

DROP POLICY IF EXISTS "public_read_documentation_photos" ON storage.objects;
CREATE POLICY "public_read_documentation_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'documentation-photos');

DROP POLICY IF EXISTS "auth_write_documentation_photos" ON storage.objects;
CREATE POLICY "auth_write_documentation_photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentation-photos');

DROP POLICY IF EXISTS "auth_update_documentation_photos" ON storage.objects;
CREATE POLICY "auth_update_documentation_photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documentation-photos');

DROP POLICY IF EXISTS "auth_delete_documentation_photos" ON storage.objects;
CREATE POLICY "auth_delete_documentation_photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documentation-photos');

-- ============================================
-- SEED: Insert default profile row
-- ============================================
INSERT INTO profile (id, display_name, program, field_of_study, year, school_name, intro_text, vision_education, vision_education_desc, vision_teacher, vision_teacher_desc, profile_photo_path)
SELECT gen_random_uuid(), 'Gomos Andreas Sianturi', 'PPG Prajabatan', 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', '2026', '', 'Saya merupakan calon guru PJOK yang ingin terus mengembangkan kemampuan dalam merancang, melaksanakan, dan mengevaluasi pembelajaran yang sesuai dengan kebutuhan peserta didik. Melalui kegiatan PPL Mandiri, saya berupaya menghubungkan teori yang dipelajari selama pendidikan profesi dengan pengalaman praktik di sekolah serta melakukan refleksi untuk memperbaiki kualitas pembelajaran.', 'Mewujudkan pendidikan Indonesia yang adaptif terhadap perkembangan teknologi dan berpusat pada peserta didik.', 'Saya meyakini bahwa teknologi dapat menjadi sarana pendukung untuk membantu guru merancang pembelajaran, menyampaikan materi, melaksanakan asesmen, dan memberikan umpan balik. Pemanfaatannya perlu disesuaikan dengan kebutuhan peserta didik dan tidak menggantikan peran guru.', 'Menjadi guru yang adaptif, inovatif, dan melek teknologi serta mampu memanfaatkan teknologi untuk mendukung pembelajaran yang berpusat pada peserta didik.', 'Dalam pembelajaran PJOK, teknologi dapat membantu peserta didik memahami gerakan, memperoleh umpan balik, melakukan refleksi, dan meningkatkan motivasi. Namun, teknologi tetap harus mendukung aktivitas fisik, interaksi sosial, kerja sama, dan pengembangan karakter.', ''
WHERE NOT EXISTS (SELECT 1 FROM profile);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teaching_products_cycle ON teaching_products(cycle);
CREATE INDEX IF NOT EXISTS idx_teaching_videos_cycle ON teaching_videos(cycle);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_documentation_sort ON documentation(sort_order);
