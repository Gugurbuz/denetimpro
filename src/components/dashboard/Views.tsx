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
  Shield,
  DollarSign,
} from 'lucide-react';
import type { Database } from '../../lib/supabase';
import { FileUpload, type ParsedData } from './FileUpload';
import { AIChat } from './AIChat';
import { SmartEditor } from './SmartEditor';
import { useAuditAnalysis } from '../../hooks/useAuditAnalysis';

type Audit = Database['public']['Tables']['audits']['Row'];

// Dashboard View
export const DashboardView: React.FC<{
  audit?: Audit;
  onNavigate: (tab: 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports') => void;
}> = ({ audit, onNavigate }) => {
  const { analysis } = useAuditAnalysis(audit?.data_loaded ? audit.id : null);

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
        <StatBox
          title="İncelenen Fiş"
          value={analysis ? analysis.totalEntries.toString() : '-'}
          icon={FileBarChart}
          colorClass="text-blue-600 bg-blue-50"
        />
        <StatBox
          title="İşlem Hacmi"
          value={analysis ? `${(analysis.totalDebit / 1000000).toFixed(1)}M TL` : '-'}
          icon={Activity}
          colorClass="text-green-600 bg-green-50"
        />
        <StatBox
          title="Risk Bulgusu"
          value={analysis ? analysis.riskFindings.length.toString() : '-'}
          icon={AlertTriangle}
          colorClass="text-orange-600 bg-orange-50"
        />
        <StatBox
          title="Ceza Riski"
          value={analysis ? `${(analysis.riskFindings.reduce((sum, f) => sum + (f.penaltyRisk || 0), 0) / 1000).toFixed(0)}K TL` : 'Beklemede'}
          icon={Shield}
          colorClass="text-red-600 bg-red-50"
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
  const { loadDemoData } = useAuditAnalysis(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileLoaded = async (data: ParsedData) => {
    if (!audit) return;

    try {
      await updateAudit(audit.id, {
        data_loaded: true,
        status: 'active',
      });
      onComplete();
    } catch (error) {
      console.error('Failed to update audit:', error);
    }
  };

  const handleLoadDemo = async () => {
    if (!audit) return;

    setLoading(true);
    try {
      await loadDemoData(audit.id);
      await updateAudit(audit.id, {
        data_loaded: true,
        status: 'active',
      });
      onComplete();
    } catch (error) {
      console.error('Failed to load demo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Demo veriler yükleniyor ve analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  return <FileUpload onFileLoaded={handleFileLoaded} onLoadDemo={handleLoadDemo} />;
};

// Analysis View
export const AnalysisView: React.FC<{
  audit?: Audit;
  onNavigate: (tab: 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports') => void;
}> = ({ audit, onNavigate }) => {
  const { analysis, loading } = useAuditAnalysis(audit?.data_loaded ? audit.id : null);

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

  if (loading || !analysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const totalPenaltyRisk = analysis.riskFindings.reduce((sum, f) => sum + (f.penaltyRisk || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Risk & Ceza Merkezi</h2>
        <div className="bg-red-50 px-6 py-3 rounded-xl border border-red-200">
          <div className="text-xs font-bold text-red-500 uppercase tracking-wider">Toplam Ceza Riski</div>
          <div className="text-2xl font-bold text-red-700">{totalPenaltyRisk.toLocaleString('tr-TR')} TL</div>
        </div>
      </div>

      <div className="grid gap-6">
        {analysis.riskFindings.map((finding) => (
          <div
            key={finding.id}
            className={`bg-white p-6 rounded-2xl border-2 ${
              finding.severity === 'high'
                ? 'border-red-200 bg-red-50/30'
                : finding.severity === 'medium'
                ? 'border-orange-200 bg-orange-50/30'
                : 'border-yellow-200 bg-yellow-50/30'
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  finding.severity === 'high'
                    ? 'bg-red-100'
                    : finding.severity === 'medium'
                    ? 'bg-orange-100'
                    : 'bg-yellow-100'
                }`}
              >
                <AlertTriangle
                  size={24}
                  className={`${
                    finding.severity === 'high'
                      ? 'text-red-600'
                      : finding.severity === 'medium'
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                        finding.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : finding.severity === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {finding.type}
                    </span>
                    <h3 className="font-bold text-lg text-slate-800">{finding.title}</h3>
                  </div>
                  {finding.penaltyRisk !== undefined && finding.penaltyRisk > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Ceza Riski</div>
                      <div className="text-xl font-bold text-red-600">
                        {finding.penaltyRisk.toLocaleString('tr-TR')} TL
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed mb-3">{finding.description}</p>
                <div className="flex gap-4 text-sm">
                  {finding.amount && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign size={16} />
                      <span className="font-medium">{finding.amount.toLocaleString('tr-TR')} TL</span>
                    </div>
                  )}
                  {finding.accountCode && (
                    <div className="text-slate-600">
                      <span className="font-bold">Hesap:</span> {finding.accountCode}
                    </div>
                  )}
                  {finding.date && (
                    <div className="text-slate-600">
                      <span className="font-bold">Tarih:</span> {finding.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Hesap Özeti</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-700">Hesap Kodu</th>
                <th className="text-left py-3 px-4 font-bold text-slate-700">Hesap Adı</th>
                <th className="text-right py-3 px-4 font-bold text-slate-700">Borç</th>
                <th className="text-right py-3 px-4 font-bold text-slate-700">Alacak</th>
                <th className="text-right py-3 px-4 font-bold text-slate-700">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {analysis.accountSummary.slice(0, 10).map((account) => (
                <tr key={account.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{account.code}</td>
                  <td className="py-3 px-4 text-slate-700">{account.name}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {account.debit.toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {account.credit.toLocaleString('tr-TR')}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      account.balance < 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {account.balance.toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
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
      <div className="flex-1 overflow-hidden">
        <AIChat auditContext={`Denetim: ${audit.name}`} />
      </div>
    </div>
  );
};

// Reports View
export const ReportsView: React.FC<{ audit?: Audit }> = ({ audit }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <SmartEditor auditName={audit?.name || 'Denetim'} auditData={audit} />
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
