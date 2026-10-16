import { useState } from 'react';
import { Plus, Trash2, Save, Upload, Eye, EyeOff, Edit3, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useDocumentation } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, type Documentation } from '@/lib/supabase';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';

export default function DocumentationEditor() {
  const { docs, refetch } = useDocumentation();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<Documentation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (doc?.file_path) await deleteFile(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS, doc.file_path);
    const { error } = await supabase.from('documentation').delete().eq('id', id);
    if (error) setToast({ msg: `Gagal: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Foto berhasil dihapus.', type: 'success' });
    setConfirmDelete(null);
    refetch();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...docs].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((d) => d.id === id);
    if (index < 0) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const swap = sorted[swapIndex];

    await supabase.from('documentation').update({ sort_order: swap.sort_order }).eq('id', current.id);
    await supabase.from('documentation').update({ sort_order: current.sort_order }).eq('id', swap.id);
    refetch();
  };

  if (showForm) {
    return (
      <DocumentationForm
        doc={editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSaved={() => { setShowForm(false); setEditing(null); refetch(); }}
        onToast={setToast}
      />
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tambah Foto
      </button>

      {docs.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Belum ada foto dokumentasi.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...docs].sort((a, b) => a.sort_order - b.sort_order).map((doc, index, arr) => {
            const url = supabase.storage.from(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS).getPublicUrl(doc.file_path).data.publicUrl;
            return (
              <div key={doc.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                  <img src={url} alt={doc.title || 'Dokumentasi'} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  {doc.title && <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>}
                  {doc.description && <p className="text-xs text-gray-500 truncate">{doc.description}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {doc.is_published ? 'Dipublikasikan' : 'Draf'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleReorder(doc.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
                      title="Naik"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(doc.id, 'down')}
                      disabled={index === arr.length - 1}
                      className="p-1.5 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
                      title="Turun"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => { setEditing(doc); setShowForm(true); }}
                      className="p-1.5 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(doc.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Foto"
        message="Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function DocumentationForm({
  doc,
  onClose,
  onSaved,
  onToast,
}: {
  doc: Documentation | null;
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
}) {
  const [title, setTitle] = useState(doc?.title || '');
  const [description, setDescription] = useState(doc?.description || '');
  const [filePath, setFilePath] = useState(doc?.file_path || '');
  const [fileName, setFileName] = useState(doc?.file_name || '');
  const [isPublished, setIsPublished] = useState(doc?.is_published || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    doc?.file_path ? supabase.storage.from(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS).getPublicUrl(doc.file_path).data.publicUrl : ''
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { path, error } = await uploadFile(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS, file, `doc-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    if (error) {
      onToast({ msg: `Gagal: ${error}`, type: 'error' });
    } else {
      if (filePath) await deleteFile(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS, filePath);
      setFilePath(path);
      setFileName(file.name);
      setImageUrl(supabase.storage.from(STORAGE_BUCKETS.DOCUMENTATION_PHOTOS).getPublicUrl(path).data.publicUrl);
      onToast({ msg: 'Foto berhasil diunggah.', type: 'success' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!filePath) {
      onToast({ msg: 'Silakan unggah foto terlebih dahulu.', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      title,
      description,
      file_path: filePath,
      file_name: fileName,
      is_published: isPublished,
      sort_order: doc?.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (doc) {
      const { error } = await supabase.from('documentation').update(payload).eq('id', doc.id);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Foto berhasil disimpan.', type: 'success' }); onSaved(); }
    } else {
      const { error } = await supabase.from('documentation').insert(payload);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Foto berhasil ditambahkan.', type: 'success' }); onSaved(); }
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">{doc ? 'Edit Foto' : 'Tambah Foto'}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
        {imageUrl && (
          <div className="w-full max-w-xs aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 mb-3 bg-gray-50">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Mengunggah...' : 'Unggah Foto'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
        {fileName && <p className="text-xs text-gray-500 mt-2">{fileName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul (opsional)</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent resize-y" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-blue-600" />
        {isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        Publikasikan (tampilkan kepada pengunjung)
      </label>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Batal</button>
      </div>
    </div>
  );
}
