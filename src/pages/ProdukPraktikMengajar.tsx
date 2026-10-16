import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Video, Star, FileText, Users } from 'lucide-react';
import { useTeachingProducts, useTeachingVideos, useStudentWorks } from '@/hooks/useData';
import EmptyState from '@/components/EmptyState';

const cycles = [
  { num: 1, label: 'Siklus 1' },
  { num: 2, label: 'Siklus 2' },
  { num: 3, label: 'Siklus 3' },
  { num: 4, label: 'Siklus 4' },
];

export default function ProdukPraktikMengajar() {
  const { products } = useTeachingProducts();
  const { videos } = useTeachingVideos();
  const { works } = useStudentWorks();

  const getCounts = (cycle: number) => {
    const p = products.filter((x) => x.cycle === cycle).length;
    const v = videos.filter((x) => x.cycle === cycle).length;
    const w = works.filter((x) => x.cycle === cycle).length;
    return { products: p, videos: v, works: w };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Produk Praktik Mengajar</h1>
        <p className="text-gray-600 max-w-3xl">
          Kumpulan produk rancangan/perencanaan pembelajaran dan video pelaksanaan praktik mengajar
          dari Siklus 1 hingga Siklus 4. Setiap siklus memiliki halaman tersendiri.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {cycles.map((cycle) => {
          const counts = getCounts(cycle.num);
          const hasContent = counts.products > 0 || counts.videos > 0 || counts.works > 0;
          const selectedProduct = products.find((p) => p.cycle === cycle.num && p.is_selected);
          const selectedVideo = videos.find((v) => v.cycle === cycle.num && v.is_selected);
          const firstWork = works.find((w) => w.cycle === cycle.num);

          return (
            <Link
              key={cycle.num}
              to={`/produk/siklus/${cycle.num}`}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors">
                    {cycle.label}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {counts.products} rancangan &middot; {counts.videos} video &middot; {counts.works} hasil peserta didik
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>

              {hasContent ? (
                <div className="space-y-3">
                  {selectedProduct && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">{selectedProduct.title || 'Rancangan pembelajaran'}</span>
                        {selectedProduct.is_selected && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 inline ml-1" fill="currentColor" />
                        )}
                      </div>
                    </div>
                  )}
                  {selectedVideo && (
                    <div className="flex items-start gap-2 text-sm">
                      <Video className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="font-medium text-gray-700">{selectedVideo.title || 'Video praktik mengajar'}</span>
                    </div>
                  )}
                  {firstWork && (
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="font-medium text-gray-700">{firstWork.title || 'Hasil pekerjaan peserta didik'}</span>
                    </div>
                  )}
                  {!selectedProduct && !selectedVideo && !firstWork && (
                    <p className="text-sm text-gray-400">Belum ada produk pilihan yang ditandai.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Konten belum tersedia untuk siklus ini.</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
