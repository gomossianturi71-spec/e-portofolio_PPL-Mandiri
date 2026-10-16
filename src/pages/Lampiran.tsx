import { useState } from 'react';
import { FileText, BookOpen, ArrowLeft } from 'lucide-react';
import { useAppendices } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';
import PdfViewer from '@/components/PdfViewer';

const cycles = [1, 2, 3, 4];
const appendixNumbers = [7, 8];

const defaultDescriptions: Record<number, string> = {
  7: 'Dokumen penilaian formatif dari dosen pengampu/pembimbing',
  8: 'Dokumen penilaian sumatif dari dosen pengampu/pembimbing',
};

export default function Lampiran() {
  const { appendices, loading } = useAppendices();
  const [readingPdf, setReadingPdf] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>('');
  const [returnCycle, setReturnCycle] = useState<number>(1);

  if (readingPdf) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
        <PdfViewer
          fileUrl={readingPdf}
          fileName={pdfName}
          onBack={() => setReadingPdf(null)}
          backLabel={`Kembali ke Lampiran Siklus ${returnCycle}`}
        />
      </div>
    );
  }

  const getAppendix = (cycle: number, appendixNumber: number) => {
    return appendices.find((a) => a.cycle === cycle && a.appendix_number === appendixNumber);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Lampiran 7 dan 8</h1>
        <p className="text-gray-600 max-w-3xl">
          Dokumen penilaian Lampiran 7 (penilaian formatif) dan Lampiran 8 (penilaian sumatif)
          dari dosen pengampu/pembimbing untuk setiap siklus praktik mengajar.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : (
        <div className="space-y-8">
          {cycles.map((cycle) => (
            <section key={cycle}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Siklus {cycle}</h2>
                  <p className="text-sm text-gray-500">
                    Dokumen penilaian untuk Siklus {cycle}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {appendixNumbers.map((appendixNum) => {
                  const appendix = getAppendix(cycle, appendixNum);
                  const hasFile = appendix && appendix.file_path && appendix.is_published;
                  const fileUrl = hasFile
                    ? supabase.storage.from(STORAGE_BUCKETS.TEACHING_PDFS).getPublicUrl(appendix.file_path).data.publicUrl
                    : null;
                  const description = appendix?.description || defaultDescriptions[appendixNum];

                  return (
                    <div
                      key={appendixNum}
                      className="bg-white rounded-lg border border-gray-200 p-5"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            Lampiran {appendixNum}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                        </div>
                      </div>

                      {hasFile && fileUrl ? (
                        <button
                          onClick={() => {
                            setPdfName(appendix.file_name || `Lampiran ${appendixNum} - Siklus ${cycle}`);
                            setReturnCycle(cycle);
                            setReadingPdf(fileUrl);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          Baca Lampiran
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Dokumen belum diunggah
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
