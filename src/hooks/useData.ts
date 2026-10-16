import { useEffect, useState, useCallback } from 'react';
import { supabase, type Profile, type TeachingProduct, type TeachingVideo, type Analysis, type Documentation, type Appendix, type StudentWork, type AnalysisType } from '@/lib/supabase';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profile').select('*').limit(1).maybeSingle();
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, refetch: fetch };
}

export function useTeachingProducts(cycle?: number) {
  const [products, setProducts] = useState<TeachingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('teaching_products').select('*').order('cycle').order('sort_order');
    if (cycle !== undefined) query = query.eq('cycle', cycle);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [cycle]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, refetch: fetch };
}

export function useTeachingVideos(cycle?: number) {
  const [videos, setVideos] = useState<TeachingVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('teaching_videos').select('*').order('cycle').order('sort_order');
    if (cycle !== undefined) query = query.eq('cycle', cycle);
    const { data } = await query;
    setVideos(data || []);
    setLoading(false);
  }, [cycle]);

  useEffect(() => { fetch(); }, [fetch]);

  return { videos, loading, refetch: fetch };
}

export function useAnalyses(type?: AnalysisType) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('analyses').select('*').order('created_at');
    if (type) query = query.eq('analysis_type', type);
    const { data } = await query;
    setAnalyses(data || []);
    setLoading(false);
  }, [type]);

  useEffect(() => { fetch(); }, [fetch]);

  return { analyses, loading, refetch: fetch };
}

export function useDocumentation() {
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('documentation').select('*').order('sort_order').order('created_at');
    setDocs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { docs, loading, refetch: fetch };
}

export function useStudentWorks(cycle?: number) {
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('student_works').select('*').order('cycle').order('sort_order');
    if (cycle !== undefined) query = query.eq('cycle', cycle);
    const { data } = await query;
    setWorks(data || []);
    setLoading(false);
  }, [cycle]);

  useEffect(() => { fetch(); }, [fetch]);

  return { works, loading, refetch: fetch };
}

export function useAppendices() {
  const [appendices, setAppendices] = useState<Appendix[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('appendices').select('*').order('cycle').order('appendix_number');
    setAppendices(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { appendices, loading, refetch: fetch };
}
