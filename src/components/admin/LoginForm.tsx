import { useState } from 'react';
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setError('Akun berhasil dibuat. Silakan masuk dengan email dan password Anda.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-gray-200 p-8 fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Halaman Kelola</h1>
            <p className="text-sm text-gray-500 mt-1">
              Masuk untuk mengelola konten e-portofolio
            </p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-all ${
                mode === 'login' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-all ${
                mode === 'register' ? 'bg-white text-accent shadow-sm' : 'text-gray-500'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>

            {error && (
              <div className={`text-sm rounded p-3 ${
                error.includes('berhasil')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Hanya pemilik dan administrator yang berwenang dapat mengelola konten.
          </p>
        </div>
      </div>
    </div>
  );
}
