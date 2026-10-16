import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type LightboxImage = {
  url: string;
  title?: string;
  description?: string;
};

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[index];

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col fade-in">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="text-white text-sm truncate max-w-[60%]">
          {image.title && <span className="font-medium">{image.title}</span>}
          {image.description && (
            <span className="text-gray-400 ml-2 hidden sm:inline">{image.description}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {index + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded transition-colors"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-4 pb-4 overflow-hidden">
        {images.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            title="Foto sebelumnya"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        <img
          src={image.url}
          alt={image.title || 'Dokumentasi'}
          className="max-w-full max-h-full object-contain rounded"
        />

        {images.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            title="Foto berikutnya"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
}
