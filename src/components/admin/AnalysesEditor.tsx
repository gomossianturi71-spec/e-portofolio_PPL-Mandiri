import { useState } from 'react';
import { Plus, Trash2, Save, Upload, Eye, EyeOff, Edit3, X, Search } from 'lucide-react';
import { useAnalyses } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, type Analysis, type AnalysisType } from '@/lib/supabase';
import { analysisConfigs, analysisTypeLabels } from '@/lib/analysisConfigs';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';

const types: AnalysisType[] = ['rancangan', 'materi', 'media', 'video', 'nonmengajar', 'instrumen'];

export default function AnalysesEditor() {
  const [activeType, setActiveType] = useState<AnalysisType>('rancangan');
  const { analyses, refetch } = useAnalyses(activeType);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<Analysis | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    const analysis = analyses.find((a) => a.id === id);
    if (analysis?.file_path) await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, analysis.file_path);
    const { error } = await supabase.from('analyses').delete().eq('id', id);
    if (error) setToast({ msg: `Gagal: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Analisis berhasil dihapus.', type: 'success' });
    setConfirmDelete(null);
    refetch();
  };

  if (showForm) {
    return (
      <AnalysisForm
        analysis={editing}
        type={activeType}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSaved={() => { setShowForm(false); setEditing(null); refetch(); }}
        onToast={setToast}
      />
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Analisis</label>
        <select
          value={activeType}
          onChange={(e) => setActiveType(e.target.value as AnalysisType)}
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent"
        >
          {types.map((t) => <option key={t} value={t}>{analysisTypeLabels[t]}</option>)}
        </select>
      </div>

      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tambah Analisis
      </button>

      {analyses.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Belum ada analisis untuk jenis ini.</p>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.is_published ? 'Dipublikasikan' : 'Draf'}
                  </span>
                  {a.cycle && <span className="text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full">Siklus {a.cycle}</span>}
                </div>
                <h4 className="font-medium text-gray-900 truncate">{a.title || 'Tanpa judul'}</h4>
                {a.subtitle && <p className="text-sm text-gray-500 truncate">{a.subtitle}</p>}
                {a.file_name && <p className="text-xs text-gray-400 mt-1 truncate">{a.file_name}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => setConfirmDelete(a.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Analisis"
        message="Apakah Anda yakin ingin menghapus analisis ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AnalysisForm({
  analysis,
  type,
  onClose,
  onSaved,
  onToast,
}: {
  analysis: Analysis | null;
  type: AnalysisType;
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
}) {
  const config = analysisConfigs[type];
  const [content, setContent] = useState<Record<string, string>>(analysis?.content || {});
  const [title, setTitle] = useState(analysis?.title || '');
  const [subtitle, setSubtitle] = useState(analysis?.subtitle || '');
  const [filePath, setFilePath] = useState(analysis?.file_path || '');
  const [fileName, setFileName] = useState(analysis?.file_name || '');
  const [isPublished, setIsPublished] = useState(analysis?.is_published || false);
  const [cycle, setCycle] = useState<number | null>(analysis?.cycle || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { path, error } = await uploadFile(STORAGE_BUCKETS.TEACHING_PDFS, file, `analysis-${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    if (error) {
      onToast({ msg: `Gagal: ${error}`, type: 'error' });
    } else {
      if (filePath) await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, filePath);
      setFilePath(path);
      setFileName(file.name);
      onToast({ msg: 'Dokumen berhasil diunggah.', type: 'success' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      analysis_type: type,
      cycle,
      title,
      subtitle,
      content,
      file_path: filePath,
      file_name: fileName,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    };

    if (analysis) {
      const { error } = await supabase.from('analyses').update(payload).eq('id', analysis.id);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Analisis berhasil disimpan.', type: 'success' }); onSaved(); }
    } else {
      const { error } = await supabase.from('analyses').insert(payload);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Analisis berhasil ditambahkan.', type: 'success' }); onSaved(); }
    }
    setSaving(false);
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Pratinjau</h3>
          <button onClick={() => setShowPreview(false)} className="text-sm text-accent hover:underline">Kembali ke Edit</button>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title || 'Tanpa Judul'}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        <dl className="space-y-4">
          {config.fields.filter((f) => f.key !== 'title').map((field) => {
            const value = content[field.key];
            if (!value) return null;
            return (
              <div key={field.key} className="border-b border-gray-100 pb-3">
                <dt className="text-sm font-semibold text-gray-500 mb-1">{field.label}</dt>
                <dd className="text-gray-800 whitespace-pre-wrap">{value}</dd>
              </div>
            );
          })}
        </dl>
        <div className="flex gap-3 pt-4">
          <button onClick={() => setShowPreview(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Edit</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan & Publikasikan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">{analysis ? 'Edit Analisis' : 'Tambah Analisis'} &mdash; {analysisTypeLabels[type]}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul (opsional)</label>
        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Siklus (opsional)</label>
          <select
            value={cycle ?? ''}
            onChange={(e) => setCycle(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Tidak terkait siklus</option>
            {[1, 2, 3, 4].map((c) => <option key={c} value={c}>Siklus {c}</option>)}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-4">
        {config.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={content[field.key] || ''}
                onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y"
              />
            ) : (
              <input
                type={field.type === 'url' ? 'url' : 'text'}
                value={content[field.key] || ''}
                onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Pendukung (opsional)</label>
        {fileName && <p className="text-sm text-gray-600 mb-2">{fileName}</p>}
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Mengunggah...' : 'Unggah Dokumen'}
          <input type="file" accept="application/pdf,image/*" onChange={handleUpload} className="hidden" />
        </label>
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
        <button onClick={() => setShowPreview(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-accent hover:bg-blue-50 rounded transition-colors">
          <Search className="w-4 h-4" /> Pratinjau
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Batal</button>
      </div>
    </div>
  );
}
