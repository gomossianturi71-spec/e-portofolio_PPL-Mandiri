import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
  Video,
  Star,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useTeachingProducts, useTeachingVideos } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import VideoEmbed from '@/components/VideoEmbed';
import EmptyState from '@/components/EmptyState';
import PdfViewer from '@/components/PdfViewer';

export default function SiklusDetail() {
  const { cycle: cycleParam } = useParams<{ cycle: string }>();
  const navigate = useNavigate();
  const cycleNum = parseInt(cycleParam || '1', 10);
  const validCycle = Math.min(Math.max(cycleNum || 1, 1), 4);

  const { products, loading: loadingProducts } = useTeachingProducts(validCycle);
  const { videos, loading: loadingVideos } = useTeachingVideos(validCycle);
  const [readingPdf, setReadingPdf] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>('');

  const cycleProducts = products.filter((p) => p.cycle === validCycle);
  const cycleVideos = videos.filter((v) => v.cycle === validCycle);

  if (readingPdf) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
        <PdfViewer
          fileUrl={readingPdf}
          fileName={pdfName}
          onBack={() => setReadingPdf(null)}
          backLabel="Kembali ke Siklus"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/produk" className="hover:text-accent transition-colors">Produk Praktik Mengajar</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Siklus {validCycle}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Siklus {validCycle}</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Produk rancangan/perencanaan pembelajaran dan video pelaksanaan praktik mengajar untuk Siklus {validCycle}.
      </p>

      {/* A. Produk Rancangan Pembelajaran */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Produk Rancangan/Perencanaan Pembelajaran
        </h2>

        {loadingProducts ? (
          <div className="text-center py-8 text-gray-400">Memuat...</div>
        ) : cycleProducts.length === 0 ? (
          <EmptyState
            title="Belum Ada Rancangan Pembelajaran"
            message="Produk rancangan pembelajaran untuk siklus ini belum diunggah. Pemilik dapat menambahkannya melalui halaman Kelola."
          />
        ) : (
          <div className="space-y-4">
            {cycleProducts.map((product) => {
              const fileUrl = product.file_path
                ? supabase.storage.from(STORAGE_BUCKETS.TEACHING_PDFS).getPublicUrl(product.file_path).data.publicUrl
                : null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{product.title || 'Tanpa Judul'}</h3>
                        {product.is_selected && (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Produk Pilihan
                          </span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div><span className="font-medium text-gray-500">Siklus:</span> {product.cycle}</div>
                        <div><span className="font-medium text-gray-500">Jenis Dokumen:</span> {product.doc_type || '-'}</div>
                        <div className="sm:col-span-2"><span className="font-medium text-gray-500">Materi:</span> {product.material || '-'}</div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-3">{product.description}</p>
                      )}
                    </div>
                  </div>

                  {fileUrl && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => {
                          setPdfName(product.file_name || product.title || 'Dokumen PDF');
                          setReadingPdf(fileUrl);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        Baca Dokumen
                      </button>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka di Tab Baru
                      </a>
                    </div>
                  )}
                  {!fileUrl && (
                    <p className="text-sm text-gray-400 mt-3">File PDF belum diunggah.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* B. Video Praktik Mengajar */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-accent" />
          Video Pelaksanaan Praktik Mengajar
        </h2>

        {loadingVideos ? (
          <div className="text-center py-8 text-gray-400">Memuat...</div>
        ) : cycleVideos.length === 0 ? (
          <EmptyState
            title="Belum Ada Video Praktik Mengajar"
            message="Video pelaksanaan praktik mengajar untuk siklus ini belum ditambahkan. Pemilik dapat menambahkannya melalui halaman Kelola."
          />
        ) : (
          <div className="space-y-6">
            {cycleVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{video.title || 'Tanpa Judul'}</h3>
                  {video.is_selected && (
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" fill="currentColor" />
                      Video Pilihan
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div><span className="font-medium text-gray-500">Siklus:</span> {video.cycle}</div>
                  <div><span className="font-medium text-gray-500">Materi:</span> {video.material || '-'}</div>
                </div>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                )}
                <VideoEmbed url={video.video_url} title={video.title} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-8 border-t border-gray-200">
        <Link
          to="/produk"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-accent hover:bg-gray-50 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Semua Siklus
        </Link>

        <div className="flex gap-3">
          {validCycle > 1 && (
            <button
              onClick={() => navigate(`/produk/siklus/${validCycle - 1}`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-accent hover:bg-blue-50 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Siklus Sebelumnya
            </button>
          )}
          {validCycle < 4 && (
            <button
              onClick={() => navigate(`/produk/siklus/${validCycle + 1}`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
            >
              Siklus Berikutnya
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
