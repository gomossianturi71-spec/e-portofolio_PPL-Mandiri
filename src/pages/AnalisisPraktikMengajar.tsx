import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Monitor,
  Video,
  ClipboardList,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

const analysisItems = [
  {
    type: 'rancangan',
    title: 'Analisis Produk Rancangan/Perencanaan Pembelajaran',
    desc: 'Analisis kesesuaian rancangan dengan tujuan, urutan kegiatan, pendekatan, asesmen, kelebihan, dan aspek perbaikan.',
    icon: FileText,
  },
  {
    type: 'materi',
    title: 'Analisis Materi Pembelajaran',
    desc: 'Kesesuaian materi dengan tujuan dan karakteristik peserta didik, ketepatan, penerapan, kelebihan, dan kendala.',
    icon: BookOpen,
  },
  {
    type: 'media',
    title: 'Analisis Media Pembelajaran',
    desc: 'Tujuan penggunaan media, alasan pemilihan, cara penggunaan, respons peserta didik, kelebihan, dan keterbatasan.',
    icon: Monitor,
  },
  {
    type: 'video',
    title: 'Analisis Video Pelaksanaan Praktik Mengajar',
    desc: 'Analisis kegiatan pendahuluan, inti, penutup, pengelolaan kelas, komunikasi, dan kesesuaian dengan rancangan.',
    icon: Video,
  },
  {
    type: 'nonmengajar',
    title: 'Analisis Kegiatan Nonmengajar',
    desc: 'Dokumentasi dan analisis kegiatan nonmengajar yang dilaksanakan selama PPL Mandiri.',
    icon: ClipboardList,
  },
  {
    type: 'instrumen',
    title: 'Instrumen Penilaian yang Dirancang Beserta Analisisnya',
    desc: 'Instrumen penilaian, kompetensi yang dinilai, indikator, rubrik, analisis kesesuaian, kelebihan, dan keterbatasan.',
    icon: ClipboardCheck,
  },
];

export default function AnalisisPraktikMengajar() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Analisis Praktik Mengajar</h1>
        <p className="text-gray-600 max-w-3xl">
          Enam komponen analisis yang mendokumentasikan dan mengevaluasi seluruh aspek
          Praktik Pengalaman Lapangan Mandiri.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {analysisItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.type}
              to={`/analisis/${item.type}`}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover-lift hover:border-accent transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-accent mt-4 group-hover:gap-2 transition-all">
                    Baca Analisis <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
