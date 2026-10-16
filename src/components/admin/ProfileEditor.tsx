import { useState, useEffect } from 'react';
import { Save, Upload, User } from 'lucide-react';
import { useProfile } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, type Profile } from '@/lib/supabase';
import Toast from '@/components/Toast';

export default function ProfileEditor() {
  const { profile, refetch } = useProfile();
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!form) return <div className="text-center py-8 text-gray-400">Memuat profil...</div>;

  const photoUrl = form.profile_photo_path
    ? supabase.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).getPublicUrl(form.profile_photo_path).data.publicUrl
    : null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { path, error } = await uploadFile(STORAGE_BUCKETS.PROFILE_PHOTOS, file, `profile-${Date.now()}`);
    if (error) {
      setToast({ msg: `Gagal mengunggah foto: ${error}`, type: 'error' });
      setUploadingPhoto(false);
      return;
    }
    if (form.profile_photo_path) {
      await deleteFile(STORAGE_BUCKETS.PROFILE_PHOTOS, form.profile_photo_path);
    }
    setForm({ ...form, profile_photo_path: path });
    setUploadingPhoto(false);
    setToast({ msg: 'Foto berhasil diunggah. Klik Simpan untuk menyimpan perubahan.', type: 'success' });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profile')
      .update({
        display_name: form.display_name,
        program: form.program,
        field_of_study: form.field_of_study,
        year: form.year,
        school_name: form.school_name,
        intro_text: form.intro_text,
        vision_education: form.vision_education,
        vision_education_desc: form.vision_education_desc,
        vision_teacher: form.vision_teacher,
        vision_teacher_desc: form.vision_teacher_desc,
        profile_photo_path: form.profile_photo_path,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id);

    if (error) setToast({ msg: `Gagal menyimpan: ${error.message}`, type: 'error' });
    else setToast({ msg: 'Profil berhasil disimpan.', type: 'success' });
    setSaving(false);
    refetch();
  };

  const update = (key: keyof Profile, value: string) => {
    setForm({ ...form, [key]: value } as Profile);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Foto Profil</h3>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto profil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-blue-700 rounded transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploadingPhoto ? 'Mengunggah...' : 'Unggah Foto'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Unggah foto profil yang profesional. Jika belum ada foto, placeholder akan ditampilkan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-2">Informasi Dasar</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Tampilan" value={form.display_name} onChange={(v) => update('display_name', v)} />
          <Field label="Program" value={form.program} onChange={(v) => update('program', v)} />
          <Field label="Bidang Studi" value={form.field_of_study} onChange={(v) => update('field_of_study', v)} />
          <Field label="Tahun" value={form.year} onChange={(v) => update('year', v)} />
          <Field label="Nama Sekolah PPL" value={form.school_name} onChange={(v) => update('school_name', v)} placeholder="Nama sekolah tempat PPL" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-2">Pengantar</h3>
        <TextAreaField label="Deskripsi Singkat" value={form.intro_text} onChange={(v) => update('intro_text', v)} rows={5} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-2">Visi dalam Pendidikan</h3>
        <TextAreaField label="Visi Pendidikan" value={form.vision_education} onChange={(v) => update('vision_education', v)} rows={2} />
        <TextAreaField label="Penjelasan Visi Pendidikan" value={form.vision_education_desc} onChange={(v) => update('vision_education_desc', v)} rows={4} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-2">Visi sebagai Calon Guru</h3>
        <TextAreaField label="Visi Calon Guru" value={form.vision_teacher} onChange={(v) => update('vision_teacher', v)} rows={2} />
        <TextAreaField label="Penjelasan Visi Calon Guru" value={form.vision_teacher_desc} onChange={(v) => update('vision_teacher_desc', v)} rows={4} />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y"
      />
    </div>
  );
}
