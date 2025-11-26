import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Volume2,
  LayoutGrid,
  FileSearch,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [proTier, setProTier] = useState(10);

  const proPlans = {
    10: { price: '2.500', audits: 10, tokens: '500K' },
    25: { price: '5.000', audits: 25, tokens: '1M' },
    50: { price: '8.500', audits: 50, tokens: '2.5M' },
    100: { price: '15.000', audits: 100, tokens: 'Unlimited' },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Denetim<span className="text-blue-600">Pro</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">
            Özellikler
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition">
            Fiyatlandırma
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="text-slate-600 font-medium hover:text-slate-900"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-600 transition shadow-lg shadow-blue-200/50"
          >
            Ücretsiz Dene
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-8 border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles size={14} /> YENİ: Gemini 2.0 AI Asistanı Yayında
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          YMM Denetiminde <br />{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Yapay Zeka Devrimi
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          e-Defterlerinizi saniyeler içinde analiz edin, vergi risklerini otomatik tespit
          edin ve Gemini AI ile profesyonel denetim raporları oluşturun.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-2 hover:-translate-y-1"
          >
            Hemen Başla <ArrowRight size={20} />
          </button>
          <button className="w-full md:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 hover:-translate-y-1">
            <Volume2 size={20} /> Demoyu İzle
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
          <div className="bg-slate-100 rounded-3xl p-4 shadow-2xl border border-slate-200 transform transition-transform hover:rotate-0 duration-700">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 h-[400px] flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <LayoutGrid size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-medium">Denetim Dashboard Önizlemesi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Denetim Süreçlerinizi Hızlandırın
            </h2>
            <p className="text-slate-500 text-lg">
              Manuel kontrollerle vakit kaybetmeyin. DenetimPro'nun gelişmiş algoritmaları
              sizin yerinize 7/24 çalışsın.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileSearch}
              title="e-Defter Analizi"
              desc="XML formatındaki yevmiye defterlerini otomatik ayrıştırır, format ve tutarlılık kontrollerini saniyeler içinde yapar."
              color="blue"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Risk Tespiti"
              desc="Kasa ters bakiye, adat hesaplama, örtülü kazanç ve tevsik sınırı ihlallerini VUK'a göre otomatik tespit eder."
              color="red"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Raporlama"
              desc="Tespit edilen bulguları Gemini AI ile yorumlayın, yönetici özeti ve taslak mailleri tek tıkla oluşturun."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Esnek Fiyatlandırma</h2>
            <p className="text-slate-500 text-lg">
              İhtiyacınıza uygun paketi seçin, kullandığınız kadar ödeyin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Starter Plan */}
            <PricingCard
              title="Başlangıç"
              price="0"
              features={[
                'Aylık 1 Denetim',
                'Günlük 100K Token Limiti',
                'Temel Risk Kontrolleri',
                'PDF Raporlama',
              ]}
              buttonText="Ücretsiz Dene"
              onAction={() => onNavigate('register')}
            />

            {/* Professional Plan */}
            <div className="relative p-8 rounded-3xl border border-blue-600 shadow-2xl shadow-blue-100 scale-105 z-10 bg-white flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                En Popüler
              </div>
              <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-2">
                Profesyonel
              </h3>

              {/* Tier Selector */}
              <div className="flex justify-between bg-slate-100 p-1 rounded-lg mb-6">
                {([10, 25, 50, 100] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setProTier(tier)}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                      proTier === tier
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Pro {tier}
                  </button>
                ))}
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₺{proPlans[proTier as keyof typeof proPlans].price}
                </span>
                <span className="text-slate-400">/ay</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 font-medium">
                Ofisinizin büyüklüğüne göre ölçeklendirin.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                  <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  Aylık {proPlans[proTier as keyof typeof proPlans].audits} Denetim
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                  <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  Günlük {proPlans[proTier as keyof typeof proPlans].tokens} Token AI Limiti
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-sm">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                  Gelişmiş AI Asistanı & Raporlama
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-sm">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                  Excel & Word Çıktıları
                </li>
              </ul>
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 rounded-xl font-bold transition bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                Hemen Başla
              </button>
            </div>

            {/* Enterprise Plan */}
            <PricingCard
              title="Kurumsal"
              price="Teklif Al"
              features={[
                'Sınırsız Denetim & Token',
                'Özel API Entegrasyonu',
                'Kendi Sunucunuzda Kurulum',
                'Öncelikli Destek Hattı',
              ]}
              buttonText="İletişime Geç"
              onAction={() => (window.location.href = 'mailto:sales@denetimpro.com')}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <ShieldCheck size={24} className="text-blue-500" /> DenetimPro
          </div>
          <div className="text-sm">
            © 2024 DenetimPro Yazılım A.Ş. Tüm hakları saklıdır.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              Gizlilik
            </a>
            <a href="#" className="hover:text-white transition">
              Kullanım Şartları
            </a>
            <a href="#" className="hover:text-white transition">
              İletişim
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}> = ({ icon: Icon, title, desc, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow">
    <div
      className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6`}
    >
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const PricingCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  onAction: () => void;
}> = ({ title, price, features, buttonText, onAction }) => (
  <div className="relative p-8 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all h-full flex flex-col">
    <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-2">
      {title}
    </h3>
    <div className="flex items-baseline gap-1 mb-6">
      {price !== 'Teklif Al' && (
        <span className="text-4xl font-extrabold text-slate-900">₺{price}</span>
      )}
      {price === 'Teklif Al' && (
        <span className="text-4xl font-extrabold text-slate-900">Teklif Al</span>
      )}
      {price !== 'Teklif Al' && <span className="text-slate-400">/ay</span>}
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
          <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
          {feature}
        </li>
      ))}
    </ul>
    <button
      onClick={onAction}
      className="w-full py-3 rounded-xl font-bold transition bg-slate-100 text-slate-900 hover:bg-slate-200"
    >
      {buttonText}
    </button>
  </div>
);
