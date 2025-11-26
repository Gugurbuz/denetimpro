import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAudits } from '../hooks/useAudits';
import { DashboardLayout } from './dashboard/DashboardLayout';
import {
  DashboardView,
  UploadView,
  AnalysisView,
  AIAssistantView,
  ReportsView,
} from './dashboard/Views';

// NEW IMPORTS FOR AI/TTS
import { GEMINI_API_URL, GEMINI_TTS_URL, pcmToWav, isGeminiConfigured } from '../lib/gemini';
import { useAuditIssues, useAuditTransactions, useChatMessages, useReportContent, usePenaltyAnalysis } from '../hooks/useAuditData';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { audits, loading, createAudit, updateAudit, deleteAudit } = useAudits(user.id);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  // Global State for UI interactions
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDocGeneratorLoading, setIsDocGeneratorLoading] = useState(false);
  const [isPenaltyLoading, setIsPenaltyLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set first audit as active if none selected
  React.useEffect(() => {
    if (!activeAuditId && audits.length > 0) {
      setActiveAuditId(audits[0].id);
    }
  }, [audits, activeAuditId]);

  const activeAudit = audits.find((a) => a.id === activeAuditId);

  // Hooks for Active Audit Data
  const { issues, saveIssues, updateIssueExplanation } = useAuditIssues(activeAuditId || undefined);
  const { transactions, saveTransactions, updateTransactionAnalysis } = useAuditTransactions(activeAuditId || undefined);
  const { messages, addMessage } = useChatMessages(activeAuditId || undefined);
  const { analysis: penaltyAnalysis, saveAnalysis } = usePenaltyAnalysis(activeAuditId || undefined);
  const { content: reportContent, saveContent, setContent: setReportContent } = useReportContent(activeAuditId || undefined);
  
  // --- AI / TTS Logic (Canvas'tan taşındı) ---
  
  const playTextToSpeech = async (text: string) => {
    if (!isGeminiConfigured() || !activeAuditId) return;

    if (isPlayingAudio) { 
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } 
      setIsPlayingAudio(false); 
      return; 
    }
    
    setIsPlayingAudio(true);
    try {
        const response = await fetch(GEMINI_TTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
            const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
            const wavBuffer = pcmToWav(base64Audio);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.play();
            audio.onended = () => setIsPlayingAudio(false);
        }
    } catch (error) { 
        console.error("TTS Error:", error);
        setIsPlayingAudio(false); 
    }
  };

  const callGemini = async (promptType: string, customPrompt: string | null = null, relatedId: string | null = null, transactionData: any = null) => {
    if (!isGeminiConfigured() || !activeAuditId) return;
    
    // Set Loading States
    if (promptType === 'penalty') setIsPenaltyLoading(true);
    else if (['summary', 'email', 'action_plan', 'meeting_agenda', 'full_report', 'translate'].includes(promptType)) setIsDocGeneratorLoading(true);
    else setIsAiLoading(true);

    let finalPrompt = "";
    const issuesData = JSON.stringify(issues); // Use issues from the hook

    // Logic based on promptType... (Using logic copied from previous canvas code)
    if (promptType === 'summary') finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). Türk Vergi Mevzuatı'na hakimsin. Bulgular: ${issuesData}\n\nGörev: Müşteri için profesyonel bir 'Yönetici Özeti' paragrafı yaz. Markdown formatında yaz.`;
    else if (promptType === 'email') finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). Türk Vergi Mevzuatı'na hakimsin. Bulgular: ${issuesData}\n\nGörev: Müşteriye gönderilecek resmi ve nazik bir e-posta taslağı yaz. Markdown formatında.`;
    else if (promptType === 'action_plan') finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). Türk Vergi Mevzuatı'na hakimsin. Bulgular: ${issuesData}\n\nGörev: 'Düzeltme Eylem Planı' listesi oluştur. Markdown madde imleri kullan.`;
    else if (promptType === 'penalty') finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). Türk Vergi Mevzuatı'na hakimsin. Bulgular: ${issuesData}\n\nGörev: VUK ceza risklerini simüle et ve 2-3 paragraflık, madde işaretli detaylı bir rapor yaz.`;
    else if (promptType === 'custom' && customPrompt) finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). Türk Vergi Mevzuatı'na hakimsin. Bulgular: ${issuesData}\n\nKullanıcı Sorusu: ${customPrompt}\n\nYanıt:`;
    else if (promptType === 'translate') finalPrompt = `Sen uzman bir Yeminli Mali Müşavirsin (YMM). İçerik: ${reportContent}\n\nGörev: Yukarıdaki denetim raporunu uluslararası bir müşteriye sunulmak üzere profesyonel İş İngilizcesine (IFRS terminolojisine uygun) çevir. Formatı koru.`;
    else if (promptType === 'explanation' && customPrompt && relatedId) finalPrompt = `Şu muhasebe hatasını analiz et: "${customPrompt}". Bu durumun vergi riskini 2 cümlede özetle.`;
    else if (promptType === 'transaction_analysis' && transactionData && relatedId) finalPrompt = `Şu işlem: ${JSON.stringify(transactionData)}\n\nBu işlemde vergi riski var mı? Kısa bir yorum yap.`;
    
    if (!finalPrompt) return;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI yanıtı alınamadı.";
      
      // Update Database via Hooks
      if (['summary', 'email', 'action_plan', 'meeting_agenda', 'full_report', 'translate'].includes(promptType)) {
        const titles: Record<string, string> = { summary: "YÖNETİCİ ÖZETİ", email: "MÜŞTERİ BİLDİRİM E-POSTASI", action_plan: "DÜZELTME EYLEM PLANI", meeting_agenda: "YÖNETİM KURULU GÜNDEMİ", full_report: "KAPSAMLI DENETİM RAPORU" };
        
        let newContent = text;
        if (promptType !== 'translate') {
          const title = titles[promptType] || "AI BLOK";
          newContent = `\n\n# ${title}\n\n${text}\n\n---\n`;
          newContent = reportContent + newContent;
        }
        await saveContent(newContent); 

      } else if (promptType === 'custom') {
        await addMessage('user', customPrompt!);
        await addMessage('ai', text);
      } else if (promptType === 'explanation' && relatedId) {
        await updateIssueExplanation(relatedId, text);
      } else if (promptType === 'transaction_analysis' && relatedId) {
        await updateTransactionAnalysis(relatedId, text);
      } else if (promptType === 'penalty') {
        await saveAnalysis(text);
      }

    } catch (error) { 
      console.error("API Call Error:", error);
      // Hata durumunda kullanıcıya hata mesajı göstermek için chat'e ekleyebiliriz
      if (promptType === 'custom') {
         await addMessage('user', customPrompt!);
         await addMessage('ai', "Bağlantı hatası: Gemini'den yanıt alınamadı. Lütfen API anahtarınızı kontrol edin.");
      }
    } finally { 
      setIsAiLoading(false);
      setIsDocGeneratorLoading(false);
      setIsPenaltyLoading(false);
    }
  };

  const handleCreateAudit = async () => {
    try {
      const newAudit = await createAudit(`Yeni Denetim #${audits.length + 1}`, 'Seçilmedi');
      setActiveAuditId(newAudit.id);
      setActiveTab('upload');
    } catch (error) {
      console.error('Failed to create audit:', error);
    }
  };

  const handleDeleteAudit = async (id: string) => {
    if (audits.length === 1) return;
    try {
      await deleteAudit(id);
      if (activeAuditId === id && audits.length > 1) {
        setActiveAuditId(audits[0].id === id ? audits[1].id : audits[0].id);
      }
    } catch (error) {
      console.error('Failed to delete audit:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // --- Props object to pass down ---
  const sharedProps = {
    activeAudit,
    issues,
    transactions,
    messages,
    reportContent,
    penaltyAnalysis,
    updateAudit,
    callGemini,
    playTextToSpeech,
    isAiLoading,
    isDocGeneratorLoading,
    isPenaltyLoading,
    isPlayingAudio,
    isGeminiConfigured: isGeminiConfigured(),
  };

  return (
    <DashboardLayout
      audits={audits}
      activeAuditId={activeAuditId}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAuditChange={setActiveAuditId}
      onCreateAudit={handleCreateAudit}
      onDeleteAudit={handleDeleteAudit}
      onLogout={onLogout}
    >
      {activeTab === 'dashboard' && <DashboardView {...sharedProps} onNavigate={setActiveTab} />}
      {activeTab === 'upload' && <UploadView {...sharedProps} onComplete={() => setActiveTab('analysis')} updateAudit={updateAudit} />}
      {activeTab === 'analysis' && <AnalysisView {...sharedProps} onNavigate={setActiveTab} setIsPenaltyModalOpen={setIsPenaltyModalOpen} isPenaltyModalOpen={false} />}
      {activeTab === 'ai-assistant' && <AIAssistantView {...sharedProps} onNavigate={setActiveTab} handleSendMessage={handleSendMessage} aiInput={''} setAiInput={()=>{}} />}
      {activeTab === 'reports' && <ReportsView {...sharedProps} setReportContent={setReportContent} setReportViewMode={setReportViewMode} reportViewMode={reportViewMode} setIsPenaltyModalOpen={setIsPenaltyModalOpen} />}
    </DashboardLayout>
  );
};