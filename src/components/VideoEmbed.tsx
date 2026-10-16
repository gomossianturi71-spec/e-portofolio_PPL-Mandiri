import { ExternalLink, Video } from 'lucide-react';
import { getEmbedUrl, getYouTubeWatchUrl } from '@/lib/video';

export default function VideoEmbed({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <Video className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          Tautan video belum dimasukkan.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Video akan ditampilkan di sini setelah pemilik menambahkan tautan.
        </p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);
  const watchUrl = getYouTubeWatchUrl(url) || url;

  if (embedUrl) {
    return (
      <div>
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={title || 'Video pembelajaran'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tonton di YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <Video className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500 mb-3">
        Video ini tidak dapat ditampilkan langsung di halaman ini.
      </p>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Buka Video di Tab Baru
      </a>
    </div>
  );
}
