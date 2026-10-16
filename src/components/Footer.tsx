import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-sm text-gray-600">
              E-Portofolio PPL Mandiri &mdash; PPG Prajabatan PJOK 2026
            </span>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-accent transition-colors">Beranda</Link>
            <Link to="/produk" className="hover:text-accent transition-colors">Produk</Link>
            <Link to="/analisis" className="hover:text-accent transition-colors">Analisis</Link>
            <Link to="/dokumentasi" className="hover:text-accent transition-colors">Dokumentasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
