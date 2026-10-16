import { useState } from 'react';
import { Plus, Trash2, Save, Upload, Star, FileText, Video, Eye, EyeOff, Edit3, X } from 'lucide-react';
import { useTeachingProducts, useTeachingVideos } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, type TeachingProduct, type TeachingVideo } from '@/lib/supabase';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';

const cycles = [1, 2, 3, 4];

export default function ProductsEditor() {
  const { products, refetch: refetchProducts } = useTeachingProducts();
  const { videos, refetch: refetchVideos } = useTeachingVideos();
  const [activeTab, setActiveTab] = useState<'products' | 'videos'>('products');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'video'; id: string } | null>(null);

  const handleDeleteProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product?.file_path) await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, product.file_path);
    const { error } = await supabase.from('teaching_products').delete().eq('id', id);
    if (error) setToast({ msg: `Gagal menghapus: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Produk berhasil dihapus.', type: 'success' });
    setConfirmDelete(null);
    refetchProducts();
  };

  const handleDeleteVideo = async (id: string) => {
    const { error } = await supabase.from('teaching_videos').delete().eq('id', id);
    if (error) setToast({ msg: `Gagal menghapus: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Video berhasil dihapus.', type: 'success' });
    setConfirmDelete(null);
    refetchVideos();
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-all ${
            activeTab === 'products' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          Rancangan Pembelajaran
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-all ${
            activeTab === 'videos' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'
          }`}
        >
          <Video className="w-4 h-4" />
          Video Praktik Mengajar
        </button>
      </div>

      {activeTab === 'products' && (
        <ProductsTab
          products={products}
          cycles={cycles}
          onRefetch={refetchProducts}
          onToast={setToast}
          onDelete={(id) => setConfirmDelete({ type: 'product', id })}
        />
      )}

      {activeTab === 'videos' && (
        <VideosTab
          videos={videos}
          cycles={cycles}
          onRefetch={refetchVideos}
          onToast={setToast}
          onDelete={(id) => setConfirmDelete({ type: 'video', id })}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Item"
        message="Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => {
          if (confirmDelete?.type === 'product') handleDeleteProduct(confirmDelete.id);
          else if (confirmDelete?.type === 'video') handleDeleteVideo(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ProductsTab({
  products,
  cycles,
  onRefetch,
  onToast,
  onDelete,
}: {
  products: TeachingProduct[];
  cycles: number[];
  onRefetch: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<TeachingProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const startNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (p: TeachingProduct) => {
    setEditing(p);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ProductForm
        product={editing}
        cycles={cycles}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSaved={() => { setShowForm(false); setEditing(null); onRefetch(); }}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={startNew}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tambah Rancangan
      </button>

      {products.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Belum ada rancangan pembelajaran.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full">Siklus {p.cycle}</span>
                  {p.is_selected && (
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" fill="currentColor" /> Pilihan
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_published ? 'Dipublikasikan' : 'Draf'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 truncate">{p.title || 'Tanpa judul'}</h4>
                <p className="text-sm text-gray-500 truncate">{p.material || 'Tanpa materi'}</p>
                {p.file_name && <p className="text-xs text-gray-400 mt-1 truncate">{p.file_name}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  cycles,
  onClose,
  onSaved,
  onToast,
}: {
  product: TeachingProduct | null;
  cycles: number[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
}) {
  const [form, setForm] = useState({
    cycle: product?.cycle || 1,
    title: product?.title || '',
    material: product?.material || '',
    doc_type: product?.doc_type || '',
    description: product?.description || '',
    file_path: product?.file_path || '',
    file_name: product?.file_name || '',
    is_selected: product?.is_selected || false,
    is_published: product?.is_published || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { path, error } = await uploadFile(STORAGE_BUCKETS.TEACHING_PDFS, file, `pdf-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    if (error) {
      onToast({ msg: `Gagal mengunggah: ${error}`, type: 'error' });
    } else {
      if (form.file_path) await deleteFile(STORAGE_BUCKETS.TEACHING_PDFS, form.file_path);
      setForm({ ...form, file_path: path, file_name: file.name });
      onToast({ msg: 'PDF berhasil diunggah. Klik Simpan untuk menyimpan.', type: 'success' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (product) {
      const { error } = await supabase.from('teaching_products').update(form).eq('id', product.id);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Produk berhasil disimpan.', type: 'success' }); onSaved(); }
    } else {
      const { error } = await supabase.from('teaching_products').insert(form);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Produk berhasil ditambahkan.', type: 'success' }); onSaved(); }
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">{product ? 'Edit Rancangan' : 'Tambah Rancangan'}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Siklus</label>
          <select
            value={form.cycle}
            onChange={(e) => setForm({ ...form, cycle: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent"
          >
            {cycles.map((c) => <option key={c} value={c}>Siklus {c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
          <input
            type="text"
            value={form.doc_type}
            onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
            placeholder="Mis. Modul Ajar, RPP, Silabus"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <Input label="Judul Dokumen" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Input label="Materi Pembelajaran" value={form.material} onChange={(v) => setForm({ ...form, material: v })} />
      <TextArea label="Deskripsi Singkat" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File PDF</label>
        {form.file_name && <p className="text-sm text-gray-600 mb-2">{form.file_name}</p>}
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Mengunggah...' : 'Unggah PDF'}
          <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_selected} onChange={(e) => setForm({ ...form, is_selected: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          <Star className="w-4 h-4 text-yellow-500" />
          Tandai sebagai produk pilihan
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          {form.is_published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          Publikasikan (tampilkan kepada pengunjung)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Batal</button>
      </div>
    </div>
  );
}

function VideosTab({
  videos,
  cycles,
  onRefetch,
  onToast,
  onDelete,
}: {
  videos: TeachingVideo[];
  cycles: number[];
  onRefetch: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<TeachingVideo | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <VideoForm
        video={editing}
        cycles={cycles}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSaved={() => { setShowForm(false); setEditing(null); onRefetch(); }}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tambah Video
      </button>

      {videos.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Belum ada video praktik mengajar.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-50 text-accent px-2 py-0.5 rounded-full">Siklus {v.cycle}</span>
                  {v.is_selected && <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full"><Star className="w-3 h-3" fill="currentColor" /> Pilihan</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v.is_published ? 'Dipublikasikan' : 'Draf'}</span>
                </div>
                <h4 className="font-medium text-gray-900 truncate">{v.title || 'Tanpa judul'}</h4>
                <p className="text-sm text-gray-500 truncate">{v.material || 'Tanpa materi'}</p>
                {v.video_url && <p className="text-xs text-accent mt-1 truncate">{v.video_url}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditing(v); setShowForm(true); }} className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(v.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoForm({
  video,
  cycles,
  onClose,
  onSaved,
  onToast,
}: {
  video: TeachingVideo | null;
  cycles: number[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: { msg: string; type: 'success' | 'error' }) => void;
}) {
  const [form, setForm] = useState({
    cycle: video?.cycle || 1,
    title: video?.title || '',
    material: video?.material || '',
    description: video?.description || '',
    video_url: video?.video_url || '',
    is_selected: video?.is_selected || false,
    is_published: video?.is_published || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (video) {
      const { error } = await supabase.from('teaching_videos').update(form).eq('id', video.id);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Video berhasil disimpan.', type: 'success' }); onSaved(); }
    } else {
      const { error } = await supabase.from('teaching_videos').insert(form);
      if (error) onToast({ msg: `Gagal: ${error.message}`, type: 'error' });
      else { onToast({ msg: 'Video berhasil ditambahkan.', type: 'success' }); onSaved(); }
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">{video ? 'Edit Video' : 'Tambah Video'}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Siklus</label>
          <select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent">
            {cycles.map((c) => <option key={c} value={c}>Siklus {c}</option>)}
          </select>
        </div>
        <Input label="Materi Pembelajaran" value={form.material} onChange={(v) => setForm({ ...form, material: v })} />
      </div>
      <Input label="Judul Video" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Input label="Tautan Video" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} placeholder="https://youtube.com/watch?v=..." />
      <TextArea label="Deskripsi Singkat" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_selected} onChange={(e) => setForm({ ...form, is_selected: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          <Star className="w-4 h-4 text-yellow-500" /> Tandai sebagai video pilihan
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          {form.is_published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />} Publikasikan
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Batal</button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y" />
    </div>
  );
}
