import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
  onNavigate: (page: string) => void;
  onSubmit: (email: string, password: string, fullName?: string) => Promise<void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ type, onNavigate, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(email, password, type === 'register' ? fullName : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setError('');
    setLoading(true);

    try {
      // Test kullanıcı bilgileri
      await onSubmit('test@denetimpro.com', 'test123456', 'Test Kullanıcı');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test girişi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {type === 'login' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {type === 'login'
              ? 'Denetim süreçlerinize kaldığınız yerden devam edin.'
              : '30 gün boyunca ücretsiz deneyin. Kredi kartı gerekmez.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                placeholder="adiniz@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                {type === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Hızlı Test Butonu */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">veya</span>
            </div>
          </div>

          <button
            onClick={handleQuickTest}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Zap size={18} /> Hızlı Test Girişi
              </>
            )}
          </button>

          <p className="mt-2 text-xs text-center text-slate-400">
            Demo hesabı ile anında giriş yapın
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          {type === 'login' ? (
            <p>
              Hesabınız yok mu?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Hemen Kayıt Olun
              </button>
            </p>
          ) : (
            <p>
              Zaten hesabınız var mı?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                Giriş Yapın
              </button>
            </p>
          )}
          <button
            onClick={() => onNavigate('landing')}
            className="mt-4 text-slate-400 hover:text-slate-600 text-xs"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
