import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useAnalyses } from '@/hooks/useData';
import { analysisConfigs } from '@/lib/analysisConfigs';
import type { AnalysisType } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';

export default function AnalisisDetail() {
  const { type } = useParams<{ type: string }>();
  const analysisType = type as AnalysisType;
  const config = analysisConfigs[analysisType];

  const { analyses, loading } = useAnalyses(analysisType);

  if (!config) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState title="Halaman Tidak Ditemukan" message="Jenis analisis ini tidak tersedia." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/analisis" className="hover:text-accent transition-colors">Analisis Praktik Mengajar</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{config.title}</span>
      </div>

      <Link
        to="/analisis"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Analisis
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h1>
      <p className="text-gray-600 mb-8">{config.subtitle}</p>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : analyses.length === 0 ? (
        <EmptyState
          title="Analisis Belum Tersedia"
          message="Analisis ini belum diisi. Pemilik website dapat menambahkan konten melalui halaman Kelola."
        />
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis, index) => {
            const content = analysis.content || {};
            const cycleLabel = analysis.cycle ? `Siklus ${analysis.cycle}` : content.cycle || '';

            return (
              <Link
                key={analysis.id}
                to={`/analisis/${analysisType}/${analysis.id}`}
                className="group bg-white rounded-lg border border-gray-200 p-5 sm:p-6 hover-lift hover:border-accent transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {cycleLabel && (
                        <span className="text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full font-medium">
                          {cycleLabel}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">Analisis {index + 1}</span>
                    </div>
                    <h2 className="font-bold text-gray-900 mb-1.5 group-hover:text-accent transition-colors">
                      {analysis.title || content.title || 'Analisis Tanpa Judul'}
                    </h2>
                    {analysis.subtitle && (
                      <p className="text-sm text-gray-500">{analysis.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-accent mt-3 group-hover:gap-2 transition-all">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
