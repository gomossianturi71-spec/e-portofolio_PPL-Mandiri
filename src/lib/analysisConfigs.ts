import type { AnalysisType } from '@/lib/supabase';

export type AnalysisField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url';
  placeholder?: string;
  options?: string[];
};

export type AnalysisConfig = {
  type: AnalysisType;
  title: string;
  subtitle: string;
  fields: AnalysisField[];
};

export const analysisConfigs: Record<AnalysisType, AnalysisConfig> = {
  rancangan: {
    type: 'rancangan',
    title: 'Analisis Produk Rancangan/Perencanaan Pembelajaran',
    subtitle: 'Analisis kesesuaian rancangan dengan tujuan pembelajaran',
    fields: [
      { key: 'title', label: 'Judul Rancangan Pembelajaran', type: 'text', placeholder: 'Masukkan judul rancangan' },
      { key: 'cycle', label: 'Siklus Terkait', type: 'select', options: ['Siklus 1', 'Siklus 2', 'Siklus 3', 'Siklus 4'] },
      { key: 'learning_objectives', label: 'Tujuan Pembelajaran', type: 'textarea', placeholder: 'Tuliskan tujuan pembelajaran' },
      { key: 'alignment_analysis', label: 'Analisis Kesesuaian Rancangan dengan Tujuan Pembelajaran', type: 'textarea' },
      { key: 'activity_sequence', label: 'Analisis Urutan Kegiatan Pembelajaran', type: 'textarea' },
      { key: 'approach_strategy', label: 'Analisis Pendekatan, Strategi, atau Model yang Digunakan', type: 'textarea' },
      { key: 'assessment_analysis', label: 'Analisis Asesmen', type: 'textarea' },
      { key: 'strengths', label: 'Kelebihan Rancangan', type: 'textarea' },
      { key: 'improvements', label: 'Aspek yang Perlu Diperbaiki', type: 'textarea' },
      { key: 'conclusion', label: 'Kesimpulan atau Pembelajaran yang Diperoleh', type: 'textarea' },
    ],
  },
  materi: {
    type: 'materi',
    title: 'Analisis Materi Pembelajaran',
    subtitle: 'Kesesuaian materi dengan tujuan dan karakteristik peserta didik',
    fields: [
      { key: 'title', label: 'Judul atau Topik Materi', type: 'text' },
      { key: 'cycle', label: 'Siklus Terkait', type: 'select', options: ['Siklus 1', 'Siklus 2', 'Siklus 3', 'Siklus 4'] },
      { key: 'material_content', label: 'Materi yang Telah Disusun dan Diterapkan', type: 'textarea' },
      { key: 'alignment_objectives', label: 'Kesesuaian Materi dengan Tujuan Pembelajaran', type: 'textarea' },
      { key: 'alignment_students', label: 'Kesesuaian Materi dengan Karakteristik Peserta Didik', type: 'textarea' },
      { key: 'clarity', label: 'Ketepatan dan Kejelasan Materi', type: 'textarea' },
      { key: 'application', label: 'Penerapan Materi saat Praktik Mengajar', type: 'textarea' },
      { key: 'strengths_challenges', label: 'Kelebihan dan Kendala', type: 'textarea' },
      { key: 'improvements', label: 'Hal yang Perlu Diperbaiki', type: 'textarea' },
    ],
  },
  media: {
    type: 'media',
    title: 'Analisis Media Pembelajaran',
    subtitle: 'Tujuan, penggunaan, dan efektivitas media pembelajaran',
    fields: [
      { key: 'title', label: 'Nama Media', type: 'text' },
      { key: 'cycle', label: 'Siklus Terkait', type: 'select', options: ['Siklus 1', 'Siklus 2', 'Siklus 3', 'Siklus 4'] },
      { key: 'media_url', label: 'Tautan Media (jika ada)', type: 'url', placeholder: 'https://...' },
      { key: 'purpose', label: 'Tujuan Penggunaan Media', type: 'textarea' },
      { key: 'reason', label: 'Alasan Memilih Media', type: 'textarea' },
      { key: 'alignment', label: 'Kesesuaian Media dengan Tujuan Pembelajaran', type: 'textarea' },
      { key: 'usage', label: 'Cara Media Digunakan saat Praktik Mengajar', type: 'textarea' },
      { key: 'student_response', label: 'Respons Peserta Didik', type: 'textarea' },
      { key: 'strengths_limitations', label: 'Kelebihan dan Keterbatasan Media', type: 'textarea' },
      { key: 'improvement_plan', label: 'Rencana Perbaikan', type: 'textarea' },
    ],
  },
  video: {
    type: 'video',
    title: 'Analisis Video Pelaksanaan Praktik Mengajar',
    subtitle: 'Analisis pelaksanaan praktik mengajar berdasarkan pengamatan video',
    fields: [
      { key: 'title', label: 'Judul Video', type: 'text' },
      { key: 'cycle', label: 'Siklus', type: 'select', options: ['Siklus 1', 'Siklus 2', 'Siklus 3', 'Siklus 4'] },
      { key: 'material', label: 'Materi Pembelajaran', type: 'text' },
      { key: 'video_url', label: 'Tautan Video', type: 'url', placeholder: 'https://youtube.com/...' },
      { key: 'context', label: 'Deskripsi Konteks Pelaksanaan', type: 'textarea' },
      { key: 'opening_analysis', label: 'Analisis Kegiatan Pendahuluan', type: 'textarea' },
      { key: 'main_analysis', label: 'Analisis Kegiatan Inti', type: 'textarea' },
      { key: 'closing_analysis', label: 'Analisis Kegiatan Penutup', type: 'textarea' },
      { key: 'class_management', label: 'Pengelolaan Kelas', type: 'textarea' },
      { key: 'communication', label: 'Komunikasi dan Interaksi dengan Peserta Didik', type: 'textarea' },
      { key: 'alignment', label: 'Kesesuaian Pelaksanaan dengan Rancangan', type: 'textarea' },
      { key: 'went_well', label: 'Bagian yang Telah Berjalan Baik', type: 'textarea' },
      { key: 'challenges', label: 'Kendala atau Bagian yang Perlu Diperbaiki', type: 'textarea' },
      { key: 'follow_up', label: 'Rencana Tindak Lanjut', type: 'textarea' },
    ],
  },
  nonmengajar: {
    type: 'nonmengajar',
    title: 'Analisis Kegiatan Nonmengajar',
    subtitle: 'Dokumentasi dan analisis kegiatan nonmengajar selama PPL Mandiri',
    fields: [
      { key: 'title', label: 'Nama Kegiatan', type: 'text' },
      { key: 'date_period', label: 'Tanggal atau Periode', type: 'text' },
      { key: 'purpose', label: 'Tujuan Kegiatan', type: 'textarea' },
      { key: 'role', label: 'Peran Mahasiswa', type: 'textarea' },
      { key: 'description', label: 'Deskripsi Pelaksanaan', type: 'textarea' },
      { key: 'results', label: 'Hasil atau Kontribusi Kegiatan', type: 'textarea' },
      { key: 'challenges', label: 'Kendala yang Dihadapi', type: 'textarea' },
      { key: 'lessons', label: 'Pembelajaran yang Diperoleh', type: 'textarea' },
      { key: 'reflection', label: 'Refleksi dan Rencana Perbaikan', type: 'textarea' },
    ],
  },
  instrumen: {
    type: 'instrumen',
    title: 'Instrumen Penilaian yang Dirancang Beserta Analisisnya',
    subtitle: 'Analisis instrumen penilaian untuk praktik mengajar',
    fields: [
      { key: 'title', label: 'Nama Instrumen', type: 'text' },
      { key: 'cycle_material', label: 'Siklus atau Materi Terkait', type: 'text' },
      { key: 'purpose', label: 'Tujuan Penilaian', type: 'textarea' },
      { key: 'competencies', label: 'Kompetensi atau Aspek yang Dinilai', type: 'textarea' },
      { key: 'indicators', label: 'Indikator Penilaian', type: 'textarea' },
      { key: 'technique', label: 'Teknik Penilaian', type: 'text' },
      { key: 'rubric', label: 'Rubrik atau Kriteria Penilaian', type: 'textarea' },
      { key: 'alignment_analysis', label: 'Analisis Kesesuaian Instrumen dengan Tujuan Pembelajaran', type: 'textarea' },
      { key: 'clarity_analysis', label: 'Analisis Kejelasan Indikator dan Kriteria', type: 'textarea' },
      { key: 'usability_analysis', label: 'Analisis Kemudahan Penggunaan Instrumen', type: 'textarea' },
      { key: 'strengths_limitations', label: 'Kelebihan dan Keterbatasan', type: 'textarea' },
      { key: 'improvement_plan', label: 'Rencana Perbaikan', type: 'textarea' },
    ],
  },
};

export const analysisTypeLabels: Record<AnalysisType, string> = {
  rancangan: 'Analisis Rancangan',
  materi: 'Analisis Materi',
  media: 'Analisis Media',
  video: 'Analisis Video',
  nonmengajar: 'Kegiatan Nonmengajar',
  instrumen: 'Instrumen Penilaian',
};
