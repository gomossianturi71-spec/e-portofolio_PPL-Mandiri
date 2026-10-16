import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  Target,
  BookOpen,
  FileText,
  Camera,
  Paperclip,
  ArrowRight,
  User,
} from 'lucide-react';
import { useProfile } from '@/hooks/useData';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';

export default function Beranda() {
  const { profile, loading } = useProfile();

  const photoUrl = profile?.profile_photo_path
    ? supabase.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).getPublicUrl(profile.profile_photo_path).data.publicUrl
    : null;

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-accent text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            PPG Prajabatan 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            E-Portofolio PPL Mandiri
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Dokumentasi, Analisis, dan Produk Praktik Pengalaman Lapangan
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-accent" />
              <span className="font-medium">{profile?.display_name || 'Gomos Andreas Sianturi'}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="text-sm text-gray-500">
              {profile?.program || 'PPG Prajabatan'}
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="text-sm text-gray-500">
              {profile?.field_of_study || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/produk"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Lihat Produk Praktik Mengajar
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/analisis"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-accent font-medium rounded border border-accent hover:bg-blue-50 transition-colors"
            >
              Lihat Analisis Praktik Mengajar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Profil Saya */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <div className="w-56 h-56 mx-auto md:mx-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={profile?.display_name || 'Foto Profil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <User className="w-16 h-16 mb-2" />
                    <span className="text-xs">Foto belum diunggah</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-10 h-1 bg-accent rounded" />
              Profil Saya
            </h2>

            <dl className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-gray-100 pb-3">
                <dt className="text-sm font-semibold text-gray-500 sm:w-32 shrink-0">Nama</dt>
                <dd className="text-gray-900">{profile?.display_name || 'Gomos Andreas Sianturi'}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-gray-100 pb-3">
                <dt className="text-sm font-semibold text-gray-500 sm:w-32 shrink-0">Program</dt>
                <dd className="text-gray-900">{profile?.program || 'PPG Prajabatan'}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-gray-100 pb-3">
                <dt className="text-sm font-semibold text-gray-500 sm:w-32 shrink-0">Bidang Studi</dt>
                <dd className="text-gray-900">{profile?.field_of_study || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'}</dd>
              </div>
              {profile?.school_name && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-gray-100 pb-3">
                  <dt className="text-sm font-semibold text-gray-500 sm:w-32 shrink-0">Sekolah PPL</dt>
                  <dd className="text-gray-900">{profile.school_name}</dd>
                </div>
              )}
            </dl>

            <p className="text-gray-700 leading-relaxed">
              {profile?.intro_text || 'Saya merupakan calon guru PJOK yang ingin terus mengembangkan kemampuan dalam merancang, melaksanakan, dan mengevaluasi pembelajaran yang sesuai dengan kebutuhan peserta didik. Melalui kegiatan PPL Mandiri, saya berupaya menghubungkan teori yang dipelajari selama pendidikan profesi dengan pengalaman praktik di sekolah serta melakukan refleksi untuk memperbaiki kualitas pembelajaran.'}
            </p>
          </div>
        </div>
      </section>

      {/* Visi Pendidikan */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Eye className="w-6 h-6 text-accent" />
            Visi Saya dalam Pendidikan
          </h2>
          <blockquote className="border-l-4 border-accent pl-6 mb-6">
            <p className="text-xl font-medium text-gray-900 italic leading-relaxed">
              "{profile?.vision_education || 'Mewujudkan pendidikan Indonesia yang adaptif terhadap perkembangan teknologi dan berpusat pada peserta didik.'}"
            </p>
          </blockquote>
          <p className="text-gray-700 leading-relaxed max-w-3xl">
            {profile?.vision_education_desc || 'Saya meyakini bahwa teknologi dapat menjadi sarana pendukung untuk membantu guru merancang pembelajaran, menyampaikan materi, melaksanakan asesmen, dan memberikan umpan balik. Pemanfaatannya perlu disesuaikan dengan kebutuhan peserta didik dan tidak menggantikan peran guru.'}
          </p>
        </div>
      </section>

      {/* Visi Calon Guru */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Target className="w-6 h-6 text-accent" />
          Visi Saya sebagai Calon Guru
        </h2>
        <blockquote className="border-l-4 border-accent pl-6 mb-6">
          <p className="text-xl font-medium text-gray-900 italic leading-relaxed">
            "{profile?.vision_teacher || 'Menjadi guru yang adaptif, inovatif, dan melek teknologi serta mampu memanfaatkan teknologi untuk mendukung pembelajaran yang berpusat pada peserta didik.'}"
          </p>
        </blockquote>
        {profile?.vision_teacher_desc && (
          <p className="text-gray-700 leading-relaxed max-w-3xl">
            {profile.vision_teacher_desc}
          </p>
        )}
        {!profile?.vision_teacher_desc && (
          <p className="text-gray-700 leading-relaxed max-w-3xl">
            Dalam pembelajaran PJOK, teknologi dapat membantu peserta didik memahami gerakan, memperoleh umpan balik, melakukan refleksi, dan meningkatkan motivasi. Namun, teknologi tetap harus mendukung aktivitas fisik, interaksi sosial, kerja sama, dan pengembangan karakter.
          </p>
        )}
      </section>

      {/* Ringkasan Isi */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Ringkasan Isi E-Portofolio
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Empat bagian utama yang mendokumentasikan seluruh kegiatan Praktik Pengalaman Lapangan Mandiri.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/produk"
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                Produk Praktik Mengajar
              </h3>
              <p className="text-sm text-gray-600">
                Rancangan pembelajaran dan video praktik mengajar dari Siklus 1 hingga Siklus 4.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent mt-4 group-hover:gap-2 transition-all">
                Lihat selengkapnya <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              to="/analisis"
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                Analisis Praktik Mengajar
              </h3>
              <p className="text-sm text-gray-600">
                Analisis rancangan, materi, media, video, kegiatan nonmengajar, dan instrumen penilaian.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent mt-4 group-hover:gap-2 transition-all">
                Lihat selengkapnya <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              to="/dokumentasi"
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                Dokumentasi PPL
              </h3>
              <p className="text-sm text-gray-600">
                Galeri foto dokumentasi kegiatan Praktik Pengalaman Lapangan Mandiri.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent mt-4 group-hover:gap-2 transition-all">
                Lihat selengkapnya <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              to="/lampiran"
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Paperclip className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                Lampiran 7 dan 8
              </h3>
              <p className="text-sm text-gray-600">
                Dokumen penilaian praktik mengajar untuk setiap siklus PPL Mandiri.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent mt-4 group-hover:gap-2 transition-all">
                Lihat selengkapnya <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
