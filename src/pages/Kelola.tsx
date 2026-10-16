import { useState } from 'react';
import { LogOut, User, BookOpen, FileText, Camera, Settings, Paperclip } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/admin/LoginForm';
import ProfileEditor from '@/components/admin/ProfileEditor';
import ProductsEditor from '@/components/admin/ProductsEditor';
import AnalysesEditor from '@/components/admin/AnalysesEditor';
import DocumentationEditor from '@/components/admin/DocumentationEditor';
import AppendicesEditor from '@/components/admin/AppendicesEditor';

type Tab = 'profile' | 'products' | 'analyses' | 'documentation' | 'appendices';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'products', label: 'Produk Praktik Mengajar', icon: BookOpen },
  { id: 'analyses', label: 'Analisis Praktik Mengajar', icon: FileText },
  { id: 'documentation', label: 'Dokumentasi', icon: Camera },
  { id: 'appendices', label: 'Lampiran 7 dan 8', icon: Paperclip },
];

export default function Kelola() {
  const { session, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent" />
            Halaman Kelola
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk sebagai {session.user.email}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'products' && <ProductsEditor />}
        {activeTab === 'analyses' && <AnalysesEditor />}
        {activeTab === 'documentation' && <DocumentationEditor />}
        {activeTab === 'appendices' && <AppendicesEditor />}
      </div>
    </div>
  );
}
