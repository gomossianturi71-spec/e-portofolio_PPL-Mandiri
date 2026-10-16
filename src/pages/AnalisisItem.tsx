import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Paperclip, BookOpen, ExternalLink } from 'lucide-react';
import { supabase, STORAGE_BUCKETS, type AnalysisType } from '@/lib/supabase';
import { analysisConfigs } from '@/lib/analysisConfigs';
import EmptyState from '@/components/EmptyState';
import VideoEmbed from '@/components/VideoEmbed';
import PdfViewer from '@/components/PdfViewer';
import { useState, useEffect } from 'react';
import type { Analysis } from '@/lib/supabase';

export default function AnalisisItem() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const analysisType = type as AnalysisType;
  const config = analysisConfigs[analysisType];

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingPdf, setReadingPdf] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setAnalysis(data);
        setLoading(false);
      });
  }, [id]);

  if (!config) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState title="Halaman Tidak Ditemukan" message="Jenis analisis ini tidak tersedia." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState
          title="Analisis Tidak Ditemukan"
          message="Analisis yang Anda cari tidak tersedia atau telah dihapus."
        />
        <div className="mt-6">
          <Link
            to={`/analisis/${analysisType}`}
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke daftar analisis
          </Link>
        </div>
      </div>
    );
  }

  const fileUrl = analysis.file_path
    ? supabase.storage.from(STORAGE_BUCKETS.TEACHING_PDFS).getPublicUrl(analysis.file_path).data.publicUrl
    : null;
  const content = analysis.content || {};
  const videoUrl = content.video_url || content.media_url || '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/analisis" className="hover:text-accent transition-colors">Analisis Praktik Mengajar</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/analisis/${analysisType}`} className="hover:text-accent transition-colors truncate max-w-[200px]">
          {config.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {analysis.title || content.title || 'Analisis'}
        </span>
      </div>

      <Link
        to={`/analisis/${analysisType}`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke {config.title}
      </Link>

      <article className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
        {analysis.cycle && (
          <span className="inline-block text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full font-medium mb-3">
            Siklus {analysis.cycle}
          </span>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {analysis.title || content.title || 'Analisis Tanpa Judul'}
        </h1>

        {analysis.subtitle && (
          <p className="text-sm text-gray-500 mb-6">{analysis.subtitle}</p>
        )}

        {videoUrl && (analysisType === 'video' || analysisType === 'media') && (
          <div className="mb-6">
            <VideoEmbed url={videoUrl} title={analysis.title} />
          </div>
        )}

        {fileUrl && !readingPdf && (
          <div className="mb-6 flex gap-3 flex-wrap items-center">
            <button
              onClick={() => setReadingPdf(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Baca Dokumen
            </button>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Buka di Tab Baru
            </a>
            <span className="text-sm text-gray-400 inline-flex items-center gap-1">
              <Paperclip className="w-4 h-4" />
              {analysis.file_name || 'Dokumen Pendukung'}
            </span>
          </div>
        )}

        {fileUrl && readingPdf && (
          <div className="mb-6">
            <PdfViewer
              fileUrl={fileUrl}
              fileName={analysis.file_name || 'Dokumen Pendukung'}
              onBack={() => setReadingPdf(false)}
              backLabel="Kembali ke Analisis"
            />
          </div>
        )}

        <dl className="space-y-5">
          {config.fields
            .filter((f) => f.key !== 'title' && f.key !== 'video_url' && f.key !== 'media_url')
            .map((field) => {
              const value = content[field.key];
              if (!value) return null;
              return (
                <div key={field.key} className="border-b border-gray-100 pb-4 last:border-0">
                  <dt className="text-sm font-semibold text-gray-500 mb-1">{field.label}</dt>
                  <dd className="text-gray-800 whitespace-pre-wrap">{value}</dd>
                </div>
              );
            })}
        </dl>
      </article>
    </div>
  );
}
