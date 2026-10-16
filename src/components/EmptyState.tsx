import { FileText } from 'lucide-react';

export default function EmptyState({
  title = 'Konten Belum Tersedia',
  message = 'Konten ini belum diisi. Pemilik website dapat menambahkan konten melalui halaman Kelola.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{message}</p>
    </div>
  );
}
