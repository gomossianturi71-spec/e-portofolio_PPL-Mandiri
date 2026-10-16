import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Produk Praktik Mengajar', path: '/produk' },
  { label: 'Analisis Praktik Mengajar', path: '/analisis' },
  { label: 'Dokumentasi PPL', path: '/dokumentasi' },
  { label: 'Lampiran 7 dan 8', path: '/lampiran' },
  { label: 'Kelola', path: '/kelola' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold tracking-tight hidden sm:inline">
              E-Portofolio PPL Mandiri
            </span>
            <span className="text-sm font-bold tracking-tight sm:hidden">
              E-Portofolio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                  isActive(item.path)
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-gray-600 hover:text-accent hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                  isActive(item.path)
                    ? 'text-accent bg-blue-50'
                    : 'text-gray-600 hover:text-accent hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
