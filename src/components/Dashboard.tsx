import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Activity,
  Sparkles,
  Bot,
  FileText,
  FileSearch,
  Maximize2,
  Hammer,
  Scale,
  Undo,
  X,
  Volume2,
  StopCircle,
  Mail,
  ClipboardList,
  AlignLeft,
  Calendar,
  Save,
  PenTool,
  Eye,
  Languages
} from 'lucide-react';
import type { Database } from '../../lib/supabase';
import { useAuditIssues, useAuditTransactions } from '../../hooks/useAuditData';

type Audit = Database['public']['Tables']['audits']['Row'];
type AuditIssue = Database['public']['Tables']['audit_issues']['Row'];
type AuditTransaction = Database['public']['Tables']['audit_transactions']['Row'];
type AuditIssueInsert = Database['public']['Tables']['audit_issues']['Insert'];
type AuditTransactionInsert = Database['public']['Tables']['audit_transactions']['Insert'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type TabType = 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports';

// --- PROPS INTERFACE (Tüm View'lar için Paylaşılan Veri) ---
interface SharedViewProps {
    activeAudit?: Audit;
    issues: AuditIssue[];
    transactions: AuditTransaction[];
    messages: ChatMessage[];
    reportContent: string;
    penaltyAnalysis: string;
    isAiLoading: boolean;
    isDocGeneratorLoading: boolean;
    isPenaltyLoading: boolean;
    isPlayingAudio: boolean;
    isGeminiConfigured: boolean;
    updateAudit: (id: string, updates: Partial<Audit>) => Promise<any>;
    callGemini: (promptType: string, customPrompt?: string | null, relatedId?: string | null, transactionData?: any) => Promise<void>;
    playTextToSpeech: (text: string) => Promise<void>;
}


// --- MOCK DATA GENERATOR (Taşındı) ---
const generateMockData = (auditId: string): AuditTransactionInsert[] => {
  const idOffset = auditId.charCodeAt(0) * 10; 
  const mockTransactions = [
    { transaction_date: '2024-01-01', description: 'Açılış Fişi', debit: 5000 + idOffset, credit: 0, account_type: '100 Kasa' },
    { transaction_date: '2024-01-02', description: 'Bankadan Çekilen', debit: 3000, credit: 0, account_type: '100 Kasa' },
    { transaction_date: '2024-01-05', description: 'Satıcı Ödemesi', debit: 0, credit: 9000 + idOffset, account_type: '100 Kasa' }, 
    { transaction_date: '2024-01-06', description: 'Nakit Satış', debit: 2000, credit: 0, account_type: '100 Kasa' },
    { transaction_date: '2024-01-10', description: 'Mal Alımı (Limit Üstü)', debit: 0, credit: 8500, account_type: '100 Kasa' }, 
    { transaction_date: '2024-01-12', description: 'Ortak Cari Çıkış', debit: 150000, credit: 0, account_type: '131 Ortaklar' },
    { transaction_date: '2024-01-15', description: 'Tahsilat', debit: 15000, credit: 0, account_type: '100 Kasa' },
    { transaction_date: '2024-02-01', description: 'Ortak İade', debit: 0, credit: 50000, account_type: '131 Ortaklar' },
    { transaction_date: '2024-02-05', description: 'Muhtelif Gider', debit: 1200, credit: 0, account_type: '770 Genel Yön.' },
  ];
  return mockTransactions.map(tx => ({ ...tx, audit_id: auditId, transaction_date: tx.transaction_date }));
};

// --- RISK DETECTION LOGIC (Taşındı) ---
const detectRisks = (transactions: AuditTransactionInsert[], auditId: string): AuditIssueInsert[] => {
  const issues: AuditIssueInsert[] = [];
  let balance100 = 0;
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  sortedTransactions.forEach(item => {
    if (item.account_type === '100 Kasa') {
      const debit = item.debit || 0;
      const credit = item.credit || 0;
      balance100 += (debit - credit);
      if (balance100 < 0) issues.push({ audit_id: auditId, type: 'Kritik', category: 'Kasa Ters Bakiye', description: `${item.transaction_date} tarihinde kasa bakiyesi ${balance100.toLocaleString('tr-TR')} TL olmuştur.`, amount: balance100, detail: "Kasa hesabının alacak bakiyesi vermesi, fiili imkansızlık nedeniyle vergi inceleme sebebidir." });
      const maxAmount = Math.max(debit, credit);
      if (maxAmount > 7000) issues.push({ audit_id: auditId, type: 'Uyarı', category: 'Tevsik Sınırı İhlali', description: `${item.transaction_date} tarihinde ${maxAmount.toLocaleString('tr-TR')} TL tutarında nakit işlem yapılmıştır.`, amount: maxAmount, detail: "VUK uyarınca 7.000 TL üzerindeki tahsilat ve ödemelerin banka aracılığıyla yapılması zorunludur." });
    }
  });

  const ortakBorc = sortedTransactions.filter(i => i.account_type === '131 Ortaklar').reduce((acc, curr) => acc + (curr.debit || 0) - (curr.credit || 0), 0);
  if (ortakBorc > 0) issues.push({ audit_id: auditId, type: 'Bilgi', category: 'Adat Hesaplaması Riski', description: `Ortaklar Cari hesabında borç bakiyesi (${ortakBorc.toLocaleString('tr-TR')} TL) tespit edildi. Transfer fiyatlandırması yönünden adat hesaplanmalıdır.`, amount: ortakBorc, detail: "Şirket kaynaklarının ortaklar tarafından kullanılması örtülü kazanç dağıtımı sayılabilir." });

  return issues;
};

// --- VIEWS ---

export const DashboardView: React.FC<SharedViewProps & { onNavigate: (tab: TabType) => void }> = ({ activeAudit, issues, onNavigate }) => {
  // ... (İçerik aynı)

  // Use the actual data lengths
  const issueCount = issues.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hoş Geldiniz, Sayın Denetçi 👋</h2>
          <p className="text-slate-500 mt-1">Bugün <span className="font-semibold text-slate-900">{activeAudit?.name || 'bir denetim'}</span> dosyası üzerinde çalışıyorsunuz.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SON GÜNCELLEME</div>
          <div className="text-sm font-medium text-slate-700">{new Date().toLocaleString('tr-TR')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox title="İncelenen Fiş" value={activeAudit?.data_loaded ? '4,250' : '-'} icon={FileBarChart} colorClass="text-blue-600 bg-blue-50" />
        <StatBox title="Tespit Edilen Risk" value={activeAudit?.data_loaded ? issueCount : '-'} icon={AlertTriangle} colorClass="text-red-600 bg-red-50" />
        <StatBox title="Risk Skoru" value={issueCount > 0 ? (issueCount > 2 ? 'Yüksek' : 'Orta') : 'Düşük'} icon={AlertTriangle} colorClass={`text-${issueCount > 0 ? 'orange' : 'green'}-600 bg-${issueCount > 0 ? 'orange' : 'green'}-50`} />
        <StatBox title="Yapay Zeka" value="Aktif" icon={Sparkles} colorClass="text-purple-600 bg-purple-50" />
      </div>

      {!activeAudit?.data_loaded ? (
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
          <p className="text-slate-600">
            Analiz sonuçlarını görüntülemek için Risk Analizi sekmesine gidin. Toplam **{issueCount}** risk tespit edildi.
          </p>
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

export const UploadView: React.FC<SharedViewProps & { onComplete: () => void }> = ({ audit, onComplete, updateAudit }) => {
  const [loading, setLoading] = React.useState(false);
  // NEW: useAuditData hook'larından save fonksiyonları alındı
  const { saveIssues } = useAuditIssues(audit?.id);
  const { saveTransactions } = useAuditTransactions(audit?.id);


  const handleAnalyze = async () => {
    if (!audit?.id) return;

    setLoading(true);
    try {
      // 1. Mock İşlemleri Oluştur (XML Parsing Simülasyonu)
      const mockTransactions = generateMockData(audit.id);

      // 2. Riskleri Tespit Et
      const detectedIssues = detectRisks(mockTransactions, audit.id);

      // 3. İşlemleri ve Riskleri Veritabanına Kaydet
      // Önemli: Bu işlemi yapmadan önce tabloların boş olduğundan emin olmak gerekir (Gerçek uygulamada kontrol yapılmalı).
      await saveTransactions(mockTransactions);
      await saveIssues(detectedIssues);
      
      // 4. Audit durumunu "Veri Yüklendi" olarak güncelle
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
          {loading ? <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" /> : <UploadCloud size={56} />}
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

export const AnalysisView: React.FC<SharedViewProps & { onNavigate: (tab: TabType) => void; setIsPenaltyModalOpen: (isOpen: boolean) => void }> = ({ 
  activeAudit, 
  issues, 
  transactions, 
  callGemini, 
  isPenaltyLoading,
  penaltyAnalysis,
  onNavigate, 
  setIsPenaltyModalOpen,
  isGeminiConfigured
}) => {
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  
  if (!activeAudit?.data_loaded) {
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

  // Helper for Issue Explanation
  const getIssueExplanation = (issueId: string) => {
    return issues.find(i => i.id === issueId)?.ai_explanation;
  }
  
  // Helper for Transaction Analysis
  const getTransactionAnalysis = (transactionId: string) => {
    return transactions.find(t => t.id === transactionId)?.ai_analysis;
  }
  
  const handleToggleIssue = (issue: AuditIssue) => {
    const isExpanded = expandedIssueId === issue.id;
    const hasExplanation = getIssueExplanation(issue.id);
    
    if (isExpanded) {
      setExpandedIssueId(null);
    } else if (hasExplanation) {
      setExpandedIssueId(issue.id);
    } else if (isGeminiConfigured) {
      callGemini('explanation', issue.description, issue.id);
    }
  };

  const handleToggleTransaction = (tx: AuditTransaction) => {
    const isExpanded = expandedTransactionId === tx.id;
    const hasAnalysis = getTransactionAnalysis(tx.id);
    
    if (isExpanded) {
      setExpandedTransactionId(null);
    } else if (hasAnalysis) {
      setExpandedTransactionId(tx.id);
    } else if (isGeminiConfigured) {
      callGemini('transaction_analysis', null, tx.id, tx);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Risk & Ceza Merkezi</h2>
          <p className="text-slate-400 mt-1">Tespit edilen {issues.length} bulgu inceleniyor.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('reports')} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:shadow-sm font-bold transition-all">
            <Sparkles size={18} className="text-purple-600" /> Rapor Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Bulgular Listesi */}
        <div className="lg:col-span-2 space-y-6">
          {issues.map((issue, idx) => {
            const isExpanded = expandedIssueId === issue.id;
            const hasExplanation = getIssueExplanation(issue.id);
            const isThisLoading = isAiLoading && expandedIssueId === issue.id;

            return (
              <div key={issue.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-xl border-blue-300 scale-[1.01]' : 'shadow-sm border-slate-100 hover:border-blue-200 hover:shadow-md'}`}>
                <div className="p-6 flex items-start gap-6">
                  <div className={`p-4 rounded-2xl shrink-0 shadow-sm ${issue.type === 'Kritik' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}><AlertTriangle size={28} /></div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-2"><h4 className="font-bold text-slate-800 text-lg">{issue.category}</h4><span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${issue.type === 'Kritik' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{issue.type}</span></div>
                    <p className="text-slate-600 leading-relaxed text-sm">{issue.description}</p>
                    <div className="flex items-center gap-3 mt-5">
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Tutar: {issue.amount.toLocaleString('tr-TR')} ₺</div>
                      <button onClick={() => handleToggleIssue(issue)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isExpanded ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`} disabled={isThisLoading || !isGeminiConfigured}>
                        {isThisLoading ? <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full"/> : <Sparkles size={14} />} {isExpanded ? 'Kapat' : 'Gemini Yorumu'}
                      </button>
                    </div>
                  </div>
                </div>
                {isExpanded && hasExplanation && (<div className="bg-slate-50/50 border-t border-slate-100 p-6 animate-in slide-in-from-top-2"><div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"><Bot size={24} className="text-indigo-600 shrink-0" /><div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed"><MarkdownRenderer content={hasExplanation}/></div></div></div>)}
              </div>
            );
          })}
          
          {/* Akıllı Fiş Analiz Tablosu */}
          <div className="pt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileSearch size={24}/></div> Akıllı Fiş Analizi</h3>
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100"><tr><th className="px-6 py-4">Tarih</th><th className="px-6 py-4">Açıklama</th><th className="px-6 py-4 text-right">Borç</th><th className="px-6 py-4 text-right">Alacak</th><th className="px-6 py-4 text-center">Analiz</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isExpanded = expandedTransactionId === tx.id;
                    const analysis = getTransactionAnalysis(tx.id);
                    const isLoading = isAiLoading && expandedTransactionId === tx.id;
                    return (
                      <React.Fragment key={tx.id}>
                        <tr className="hover:bg-slate-50 transition-colors group"><td className="px-6 py-4 text-slate-600 font-medium">{tx.transaction_date}</td><td className="px-6 py-4 font-medium text-slate-700">{tx.description} <span className="text-slate-400 font-normal ml-1">({tx.account_type})</span></td><td className="px-6 py-4 text-right text-slate-600">{tx.debit > 0 ? tx.debit.toLocaleString('tr-TR') : '-'}</td><td className="px-6 py-4 text-right text-slate-600">{tx.credit > 0 ? tx.credit.toLocaleString('tr-TR') : '-'}</td><td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleToggleTransaction(tx)} 
                            className={`p-2 rounded-lg transition-all ${isExpanded || analysis ? 'bg-purple-100 text-purple-600' : 'text-slate-300 hover:bg-purple-50 hover:text-purple-500'}`}
                            disabled={isLoading || !isGeminiConfigured}
                          >
                            {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"/> : <Sparkles size={18} />}
                          </button>
                        </td></tr>
                        {isExpanded && analysis && (<tr><td colSpan="5" className="px-6 py-4 bg-purple-50/30"><div className="flex gap-4 text-sm text-purple-900 bg-white p-5 rounded-xl border border-purple-100 shadow-sm animate-in slide-in-from-top-1"><Bot size={20} className="shrink-0 text-purple-500 mt-0.5" /><div className="whitespace-pre-wrap leading-relaxed font-medium"><MarkdownRenderer content={analysis}/></div></div></td></tr>)}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Ceza Simülasyonu */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-300 sticky top-24 ring-4 ring-slate-50">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6"><div className="bg-red-500/20 p-3 rounded-xl text-red-400 backdrop-blur-sm"><Hammer size={28} /></div><div><h3 className="font-bold text-xl">Ceza Simülasyonu</h3><p className="text-xs text-slate-400 mt-1">VUK 359 & 353 Kapsamı</p></div></div>
            
            {!penaltyAnalysis ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Mevcut bulgulara göre tahmini vergi ziyaı ve özel usulsüzlük cezalarını yapay zeka ile hesaplayın.</p>
                <button onClick={() => callGemini('penalty')} disabled={isPenaltyLoading || !isGeminiConfigured} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
                  {isPenaltyLoading ? <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"/> : <Scale size={20} />} Risk Hesapla
                </button>
              </div>
            ) : (
              <div className="text-center py-10 animate-in fade-in zoom-in-95">
                <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/10 backdrop-blur-sm"><CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" /><h4 className="font-bold text-lg mb-1">Analiz Tamamlandı</h4><p className="text-sm text-slate-300">Simülasyon raporu hazırlandı.</p></div>
                <div className="space-y-3">
                  <button onClick={() => setIsPenaltyModalOpen(true)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-lg"><Maximize2 size={18}/> Raporu İncele</button>
                  <button onClick={() => callGemini('penalty')} disabled={isPenaltyLoading} className="w-full py-3 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition flex items-center justify-center gap-2">{isPenaltyLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <Undo size={16}/>} Yeniden Hesapla</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIAssistantView: React.FC<SharedViewProps & { onNavigate: (tab: TabType) => void; handleSendMessage: (text: string) => void; aiInput: string; setAiInput: (text: string) => void }> = ({ 
    activeAudit, 
    messages, 
    callGemini, 
    isAiLoading, 
    playTextToSpeech, 
    isPlayingAudio,
    handleSendMessage,
    aiInput,
    setAiInput,
    isGeminiConfigured
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!activeAudit?.data_loaded) {
        return (
            <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Sparkles size={48} className="text-indigo-500 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Asistan Beklemede</h3>
                    <p className="text-slate-500 mb-6">Veri yüklendikten sonra AI asistanı aktif olacak.</p>
                    <button onClick={() => onNavigate('upload')} className="mt-6 text-indigo-600 font-bold hover:underline">Veri Yüklemeye Git →</button>
                </div>
            </div>
        );
    }
    
    const handleQuickAction = (promptType: string) => {
        if (promptType === 'summary') callGemini('summary');
        else if (promptType === 'risk') callGemini('custom', 'Bu denetimdeki en kritik 3 vergi riskini VUK maddeleriyle özetle.');
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <div className="bg-slate-50/80 backdrop-blur-md p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4"><div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200"><Bot size={24} /></div><div><h3 className="font-bold text-slate-800">Gemini Pro Asistan</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Çevrimiçi</p></div></div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FAFAFA]" id="chat-container">
                {messages.length === 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button onClick={() => handleQuickAction('summary')} disabled={!isGeminiConfigured} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 shadow-sm text-left"><FileText size={18} className="text-indigo-600 mb-2" /><span className="font-bold text-slate-800 text-sm">Yönetici Özeti</span><p className="text-xs text-slate-500">Tüm bulguları tek paragrafta özetle.</p></button>
                        <button onClick={() => handleQuickAction('risk')} disabled={!isGeminiConfigured} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-purple-300 shadow-sm text-left"><AlertTriangle size={18} className="text-purple-600 mb-2" /><span className="font-bold text-slate-800 text-sm">Kritik Risk Analizi</span><p className="text-xs text-slate-500">En önemli 3 riski listele.</p></button>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><Bot size={16} className="text-indigo-600" /></div>}
                        <div className={`max-w-[85%] p-6 rounded-[1.5rem] shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                            <div className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                {msg.role === 'ai' ? <MarkdownRenderer content={msg.content} /> : msg.content}
                            </div>
                            {msg.role === 'ai' && isGeminiConfigured && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                    <button onClick={() => playTextToSpeech(msg.content)} className={`p-2 rounded-full hover:bg-slate-50 transition ${isPlayingAudio ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{isPlayingAudio ? <StopCircle size={16} /> : <Volume2 size={16} />}</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isAiLoading && <div className="flex justify-start"><div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3"><span className="text-xs text-slate-400 font-bold animate-pulse">YAZIYOR...</span></div></div>}
                <div ref={scrollRef} />
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
                    <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Mevzuat veya bulgular hakkında sorun..." className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder-slate-400 shadow-inner font-medium" disabled={!isGeminiConfigured}/>
                    <button onClick={() => handleSendMessage(aiInput)} disabled={!aiInput.trim() || isAiLoading || !isGeminiConfigured} className="absolute right-2 top-2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"><Send size={20} /></button>
                </div>
            </div>
        </div>
    );
};

export const ReportsView: React.FC<SharedViewProps & { setReportContent: (content: string) => void; setReportViewMode: (mode: 'edit' | 'preview') => void; reportViewMode: 'edit' | 'preview'; setIsPenaltyModalOpen: (isOpen: boolean) => void }> = ({ 
  activeAudit, 
  reportContent, 
  setReportContent, 
  setReportViewMode, 
  reportViewMode, 
  callGemini, 
  isDocGeneratorLoading,
  setIsPenaltyModalOpen,
  isGeminiConfigured
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const applyFormat = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let newText = text;
    switch (format) {
        case 'bold': newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end); break;
        case 'italic': newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end); break;
        case 'h1': newText = text.substring(0, start) + `\n# ${selectedText}` + text.substring(end); break;
        case 'h2': newText = text.substring(0, start) + `\n## ${selectedText}` + text.substring(end); break;
        case 'list': newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end); break;
        case 'quote': newText = text.substring(0, start) + `\n> ${selectedText}` + text.substring(end); break;
    }
    setReportContent(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(end + (newText.length - text.length), end + (newText.length - text.length)); }, 0);
  };
  
  const charCount = reportContent.length;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 sticky top-0">
            <div className="flex items-center gap-4"><div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-md"><FileText size={20}/></div><div><h1 className="font-bold text-lg text-slate-800 leading-none">Akıllı Rapor</h1><p className="text-xs font-medium text-slate-400 mt-1">{activeAudit?.name || 'Denetim'}</p></div></div>
            
            {/* Unified Toolbar */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1 gap-1 mx-4">
                <span className="text-[10px] font-bold text-indigo-500 px-2">AI:</span>
                
                <AiToolbarButton id="summary" icon={AlignLeft} label="Özet" loading={isDocGeneratorLoading} onClick={() => callGemini('summary')} />
                <AiToolbarButton id="email" icon={Mail} label="Mail" loading={isDocGeneratorLoading} onClick={() => callGemini('email')} />
                <AiToolbarButton id="action_plan" icon={ClipboardList} label="Plan" loading={isDocGeneratorLoading} onClick={() => callGemini('action_plan')} />
                
                <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
                    <button onClick={() => callGemini('translate')} disabled={isDocGeneratorLoading} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-600 transition" title="Çevir (EN)" aria-label="Translate to English"><Languages size={16}/></button>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-1">
                    <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition" title="Kalın"><Bold size={16}/></button>
                    <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition" title="İtalik"><Italic size={16}/></button>
                    <button onClick={() => applyFormat('h1')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition flex items-center gap-0.5"><Heading1 size={16}/></button>
                    <button onClick={() => applyFormat('h2')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition flex items-center gap-0.5"><Heading2 size={16}/></button>
                    <button onClick={() => applyFormat('list')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition" title="Liste"><List size={16}/></button>
                    <button onClick={() => applyFormat('quote')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition" title="Alıntı"><Quote size={16}/></button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{charCount} KARAKTER</span>
                <button onClick={() => setReportViewMode(reportViewMode === 'edit' ? 'preview' : 'edit')} className={`p-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${reportViewMode === 'preview' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {reportViewMode === 'edit' ? <><Eye size={18}/> Önizle</> : <><PenTool size={18}/> Düzenle</>}
                </button>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"><Save size={16}/> Dışa Aktar (PDF)</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex justify-center items-start scroll-smooth">
            <div className="w-full max-w-4xl bg-white min-h-[1100px] shadow-xl shadow-slate-200/60 border border-slate-200 p-16 rounded-xl relative transition-all duration-300 mb-20">
                
                {isDocGeneratorLoading && (
                    <div className="absolute top-6 right-8 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100"><Sparkles size={12} className="animate-spin-slow" /> Gemini yazıyor...</div>
                    </div>
                )}

                {reportViewMode === 'edit' ? (
                    <textarea
                        ref={editorRef}
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                        className="w-full h-full min-h-[1000px] resize-none outline-none text-slate-700 leading-loose font-serif text-lg placeholder:text-slate-300 placeholder:font-sans bg-transparent selection:bg-indigo-100 selection:text-indigo-900 p-2"
                        spellCheck="false"
                        placeholder="Rapor içeriğini buraya yazın veya AI araçlarını kullanın..."
                    />
                ) : (
                    <div className="prose prose-lg max-w-none font-serif text-slate-800 leading-loose">
                        <MarkdownRenderer content={reportContent || "Görüntülenecek içerik yok."} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// Helper Component
const StatBox: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  trend?: string | null;
  delay?: number;
}> = ({ title, value, icon: Icon, colorClass, trend, delay }) => (
  <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`} style={{animationDelay: `${delay}ms`}}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}><Icon size={20} /></div>
      {trend && <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100"><TrendingUp size={12} className="mr-1" /> {trend}</span>}
    </div>
    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
    <p className="text-slate-400 text-sm font-medium mt-1">{title}</p>
  </div>
);