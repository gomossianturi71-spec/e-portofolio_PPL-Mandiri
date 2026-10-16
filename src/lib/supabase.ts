import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  TEACHING_PDFS: 'teaching-pdfs',
  DOCUMENTATION_PHOTOS: 'documentation-photos',
} as const;

export type Profile = {
  id: string;
  display_name: string;
  program: string;
  field_of_study: string;
  year: string;
  school_name: string;
  intro_text: string;
  vision_education: string;
  vision_education_desc: string;
  vision_teacher: string;
  vision_teacher_desc: string;
  profile_photo_path: string;
  updated_at: string;
};

export type TeachingProduct = {
  id: string;
  cycle: number;
  title: string;
  material: string;
  doc_type: string;
  description: string;
  file_path: string;
  file_name: string;
  is_selected: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TeachingVideo = {
  id: string;
  cycle: number;
  title: string;
  material: string;
  description: string;
  video_url: string;
  is_selected: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AnalysisType = 'rancangan' | 'materi' | 'media' | 'video' | 'nonmengajar' | 'instrumen';

export type Analysis = {
  id: string;
  analysis_type: AnalysisType;
  cycle: number | null;
  title: string;
  subtitle: string;
  content: Record<string, string>;
  file_path: string;
  file_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Documentation = {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentWork = {
  id: string;
  cycle: number;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Appendix = {
  id: string;
  cycle: number;
  appendix_number: number;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFile(bucket: string, file: File, path?: string): Promise<{ path: string; error: string | null }> {
  const fileName = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) return { path: '', error: error.message };
  return { path: fileName, error: null };
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: string | null }> {
  if (!path) return { error: null };
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message || null };
}
