import { useState } from 'react';
import { Upload, Save, Trash2, FileText, Eye, EyeOff, X, BookOpen } from 'lucide-react';
import { useAppendices } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, type Appendix } from '@/lib/supabase';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const cycles = [1, 2, 3, 4];
const appendixNumbers = [7, 8];

const defaultDescriptions: Record<number, string> = {
  7: 'Dokumen penilaian formatif dari dosen pengampu/pembimbing',
  8: 'Dokumen penilaian sumatif dari dosen pengampu/pembimbing',
};

export default function AppendicesEditor() {
  const { appendices, refetch } = useAppendices();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ cycle: number; appendixNumber: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ cycle: number; appendixNumber: number } | null>(null);

  const getAppendix = (cycle: number, appendixNumber: number) => {
    return appendices.find((a) => a.cycle === cycle && a.appendix_number === appendixNumber);
  };

  const handleDelete = async (cycle: number, appendixNumber: number) => {
    const existing = getAppendix(cycle, appendixNumber);
    if (existing?.file_path) {
      await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, existing.file_path);
    }
    const { error } = await supabase.from('appendices').delete().eq('cycle', cycle).eq('appendix_number', appendixNumber);
    if (error) setToast({ msg: `Gagal: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Dokumen lampiran berhasil dihapus.', type: 'success' });
    setConfirmDelete(null);
    refetch();
  };

  if (editingSlot) {
    return (
      <AppendixForm
        cycle={editingSlot.cycle}
        appendixNumber={editingSlot.appendixNumber}
        existing={getAppendix(editingSlot.cycle, editingSlot.appendixNumber) ?? null}
        onClose={() => setEditingSlot(null)}
        onSaved={() => { setEditingSlot(null); refetch(); }}
        onToast={setToast}
      />
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-4">
        {cycles.map((cycle) => (
          <div key={cycle}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-gray-900">Siklus {cycle}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {appendixNumbers.map((appendixNum) => {
                const appendix = getAppendix(cycle, appendixNum);
                const hasFile = appendix && appendix.file_path;

                return (
                  <div key={appendixNum} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full font-medium">
                            Lampiran {appendixNum}
                          </span>
                          {appendix && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${appendix.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {appendix.is_published ? 'Dipublikasikan' : 'Draf'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          Lampiran {appendixNum} — Siklus {cycle}
                        </h4>
                        {hasFile && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{appendix!.file_name}</p>
                        )}
                        {!hasFile && (
                          <p className="text-xs text-gray-400 mt-1 italic">Belum diunggah</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditingSlot({ cycle, appendixNumber: appendixNum })}
                          className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors"
                          title="Unggah/Edit"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {hasFile && (
                          <button
                            onClick={() => setConfirmDelete({ cycle, appendixNumber: appendixNum })}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Dokumen Lampiran"
        message="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.cycle, confirmDelete.appendixNumber)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AppendixForm({
  cycle,
  appendixNumber,
  existing,
  onClose,
  onSaved,
  onToast,
}: {
  cycle: number;
  appendixNumber: number;
  existing: Appendix | null;
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
}) {
  const [description, setDescription] = useState(existing?.description || defaultDescriptions[appendixNumber]);
  const [filePath, setFilePath] = useState(existing?.file_path || '');
  const [fileName, setFileName] = useState(existing?.file_name || '');
  const [isPublished, setIsPublished] = useState(existing?.is_published || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { path, error } = await uploadFile(
      STORAGE_BUCKETS.TEACHING_PDFS,
      file,
      `lampiran-${appendixNumber}-siklus-${cycle}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    );
    if (error) {
      onToast({ msg: `Gagal mengunggah: ${error}`, type: 'error' });
    } else {
      if (filePath) await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, filePath);
      setFilePath(path);
      setFileName(file.name);
      onToast({ msg: 'PDF berhasil diunggah. Klik Simpan untuk menyimpan.', type: 'success' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const title = `Lampiran ${appendixNumber} - Siklus ${cycle}`;
    const payload = {
      cycle,
      appendix_number: appendixNumber,
      title,
      description,
      file_path: filePath,
      file_name: fileName,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase.from('appendices').update(payload).eq('id', existing.id);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Dokumen lampiran berhasil disimpan.', type: 'success' }); onSaved(); }
    } else {
      const { error } = await supabase.from('appendices').insert(payload);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Dokumen lampiran berhasil ditambahkan.', type: 'success' }); onSaved(); }
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">
          Lampiran {appendixNumber} — Siklus {cycle}
        </h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Dokumen</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File PDF</label>
        {fileName && (
          <p className="text-sm text-gray-600 mb-2">{fileName}</p>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Mengunggah...' : 'Unggah PDF'}
          <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-blue-600" />
        {isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        Publikasikan (tampilkan kepada pengunjung)
      </label>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
