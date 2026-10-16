import { useState } from 'react';
import { Camera, ZoomIn } from 'lucide-react';
import { useDocumentation } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';
import Lightbox, { type LightboxImage } from '@/components/Lightbox';

export default function DokumentasiPPL() {
  const { docs, loading } = useDocumentation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images: LightboxImage[] = docs.map((doc) => ({
    url: supabase.storage.from(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS).getPublicUrl(doc.file_path).data.publicUrl,
    title: doc.title,
    description: doc.description,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Dokumentasi PPL</h1>
        <p className="text-gray-600 max-w-3xl">
          Galeri dokumentasi kegiatan Praktik Pengalaman Lapangan Mandiri. Klik foto untuk memperbesar.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : docs.length === 0 ? (
        <EmptyState
          title="Belum Ada Dokumentasi"
          message="Foto dokumentasi belum diunggah. Pemilik dapat menambahkan foto melalui halaman Kelola."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, index) => {
              const url = supabase.storage.from(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS).getPublicUrl(doc.file_path).data.publicUrl;
              return (
                <button
                  key={doc.id}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover-lift cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={url}
                      alt={doc.title || 'Dokumentasi'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white text-left">
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <ZoomIn className="w-3 h-3" />
                        Klik untuk memperbesar
                      </div>
                      {doc.title && <p className="text-sm font-medium">{doc.title}</p>}
                    </div>
                  </div>
                  {(doc.title || doc.description) && (
                    <div className="p-3 text-left">
                      {doc.title && <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>}
                      {doc.description && <p className="text-xs text-gray-500 truncate">{doc.description}</p>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {lightboxIndex !== null && (
            <Lightbox
              images={images}
              index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={setLightboxIndex}
            />
          )}
        </>
      )}
    </div>
  );
}
