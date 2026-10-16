/*
# Fix RLS policies for admin draft access

## Problem
The original policies used `TO anon, authenticated USING (is_published = true)` 
which means even authenticated admin users could only see published rows.
Drafts were invisible in the admin panel.

## Fix
Split each SELECT policy into two:
1. Anon: can only see published rows
2. Authenticated: can see all rows (including drafts)

This allows the admin to manage draft content while keeping unpublished 
content hidden from public visitors.

## Tables affected
- teaching_products
- teaching_videos
- analyses
- documentation

## Notes
1. Profile table is already fully public (no is_published filter needed).
2. INSERT/UPDATE/DELETE policies remain authenticated-only, unchanged.
*/

-- teaching_products
DROP POLICY IF EXISTS "public_read_teaching_products" ON teaching_products;
CREATE POLICY "anon_read_published_teaching_products" ON teaching_products FOR SELECT
  TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_teaching_products" ON teaching_products FOR SELECT
  TO authenticated USING (true);

-- teaching_videos
DROP POLICY IF EXISTS "public_read_teaching_videos" ON teaching_videos;
CREATE POLICY "anon_read_published_teaching_videos" ON teaching_videos FOR SELECT
  TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_teaching_videos" ON teaching_videos FOR SELECT
  TO authenticated USING (true);

-- analyses
DROP POLICY IF EXISTS "public_read_analyses" ON analyses;
CREATE POLICY "anon_read_published_analyses" ON analyses FOR SELECT
  TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_analyses" ON analyses FOR SELECT
  TO authenticated USING (true);

-- documentation
DROP POLICY IF EXISTS "public_read_documentation" ON documentation;
CREATE POLICY "anon_read_published_documentation" ON documentation FOR SELECT
  TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_documentation" ON documentation FOR SELECT
  TO authenticated USING (true);
