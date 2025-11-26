import React from 'react';
import {
  UploadCloud,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Activity,
  Sparkles,
  Bot,
  FileText,
} from 'lucide-react';
import type { Database } from '../../lib/supabase';

type Audit = Database['public']['Tables']['audits']['Row'];

// Dashboard View
export const DashboardView: React.FC<{
  audit?: Audit;
  onNavigate: (tab: 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports') => void;
}> = ({ audit, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Hoş Geldiniz, Sayın Denetçi 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Bugün <span className="font-semibold text-slate-900">{audit?.name || 'bir denetim'}</span> dosyası
            üzerinde çalışıyorsunuz.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            SON GÜNCELLEME
          </div>
          <div className="text-sm font-medium text-slate-700">{new Date().toLocaleString('tr-TR')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox title="İncelenen Fiş" value="-" icon={FileBarChart} colorClass="text-blue-600 bg-blue-50" />
        <StatBox title="İşlem Hacmi" value="-" icon={Activity} colorClass="text-indigo-600 bg-indigo-50" />
        <StatBox title="Risk Skoru" value="-" icon={AlertTriangle} colorClass="text-orange-600 bg-orange-50" />
        <StatBox
          title="Yapay Zeka"
          value="Beklemede"
          icon={Sparkles}
          colorClass="text-purple-600 bg-purple-50"
        />
      </div>

      {!audit?.data_loaded ? (
        <div className="h-96 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group hover:bg-white transition-colors">
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-100 mb-6 relative z-10 transform group-hover:scale-110 transition-transform duration-500">
            <UploadCloud size={48} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 relative z-10">
            Analize Başlamak İçin Dosya Yükleyin
          </h3>
          <p className="text-slate-400 mt-2 max-w-md text-center relative z-10">
            e-Defter (XML) formatındaki yevmiye defterlerini buraya sürükleyin veya örnek veriyi kullanın.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 relative z-10 shadow-xl"
          >
            Veri Yüklemeye Git
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Denetim Tamamlandı</h3>
          <p className="text-slate-600">Analiz sonuçlarını görüntülemek için Risk Analizi sekmesine gidin.</p>
          <button
            onClick={() => onNavigate('analysis')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Risk Analizini Görüntüle
          </button>
        </div>
      )}
    </div>
  );
};

// Upload View
export const UploadView: React.FC<{
  audit?: Audit;
  onComplete: () => void;
  updateAudit: (id: string, updates: Partial<Audit>) => Promise<any>;
}> = ({ audit, onComplete, updateAudit }) => {
  const [loading, setLoading] = React.useState(false);

  const handleAnalyze = async () => {
    if (!audit) return;

    setLoading(true);
    try {
      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update audit as data loaded
      await updateAudit(audit.id, {
        data_loaded: true,
        status: 'active',
      });

      onComplete();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
      <div className="bg-white p-16 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center max-w-2xl w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="h-28 w-28 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" />
        </div>
        <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Veri Kaynağı</h2>
        <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">
          Analize başlamak için Yevmiye Defteri (XML) dosyanızı yükleyin veya demo veriyi kullanın.
        </p>
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-3 group"
          >
            {loading ? 'Analiz Yapılıyor...' : 'Demo Veriyi Analiz Et'}{' '}
            {!loading && <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
          <button className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-600 rounded-2xl font-bold text-lg transition-all">
            Dosya Seç...
          </button>
        </div>
      </div>
    </div>
  );
};

// Analysis View
export const AnalysisView: React.FC<{
  audit?: Audit;
  onNavigate: (tab: 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports') => void;
}> = ({ audit, onNavigate }) => {
  if (!audit?.data_loaded) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <AlertTriangle size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-400 font-medium">Veri bulunamadı.</p>
        <button onClick={() => onNavigate('upload')} className="text-blue-600 font-bold mt-2 hover:underline">
          Veri Yükle
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Risk & Ceza Merkezi</h2>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-slate-600">
          Risk analizi sonuçları burada görüntülenecek. Gerçek veri yüklendiğinde otomatik olarak tespit
          edilecek.
        </p>
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertTriangle size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Örnek Risk Bulgusu</h4>
              <p className="text-sm text-slate-600">
                Gerçek XML verisi yüklendiğinde, kasa ters bakiye, tevsik sınırı ihlalleri ve diğer riskler
                otomatik olarak tespit edilecek.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Assistant View
export const AIAssistantView: React.FC<{
  audit?: Audit;
  onNavigate: (tab: 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports') => void;
}> = ({ audit, onNavigate }) => {
  if (!audit?.data_loaded) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Sparkles size={48} className="text-indigo-500 mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Asistan Beklemede</h3>
          <p className="text-slate-500 mb-6">Veri yüklendikten sonra AI asistanı aktif olacak.</p>
          <button
            onClick={() => onNavigate('upload')}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Veri Yüklemeye Git →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="bg-slate-50/80 backdrop-blur-md p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Gemini Pro Asistan</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Çevrimiçi
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Bot size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">
            AI asistanı entegrasyonu tamamlandı. Gemini API anahtarını .env dosyasına ekleyin.
          </p>
        </div>
      </div>
    </div>
  );
};

// Reports View
export const ReportsView: React.FC<{ audit?: Audit }> = ({ audit }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-md">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 leading-none">Akıllı Rapor</h1>
            <p className="text-xs font-medium text-slate-400 mt-1">{audit?.name || 'Denetim'}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white min-h-[1100px] shadow-xl shadow-slate-200/60 border border-slate-200 p-16 rounded-xl">
          <h2 className="text-3xl font-bold mb-6">Denetim Raporu</h2>
          <p className="text-slate-600 leading-relaxed">
            Rapor editörü hazır. AI ile otomatik rapor oluşturma özelliği Gemini API anahtarı eklendikten
            sonra aktif olacak.
          </p>
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-lg mb-2">Özellikler:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Yönetici özeti oluşturma</li>
              <li>✓ E-posta taslağı hazırlama</li>
              <li>✓ Eylem planı oluşturma</li>
              <li>✓ PDF/Word export</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const StatBox: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
        <Icon size={20} />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
    <p className="text-slate-400 text-sm font-medium mt-1">{title}</p>
  </div>
);
