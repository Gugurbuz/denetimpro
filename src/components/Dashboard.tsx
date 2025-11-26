import React, { useState } from 'react';
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

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { audits, loading, createAudit, updateAudit, deleteAudit } = useAudits(user.id);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  // Set first audit as active if none selected
  React.useEffect(() => {
    if (!activeAuditId && audits.length > 0) {
      setActiveAuditId(audits[0].id);
    }
  }, [audits, activeAuditId]);

  const activeAudit = audits.find((a) => a.id === activeAuditId);

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
      activeAudit={activeAudit}
    >
      {activeTab === 'dashboard' && <DashboardView audit={activeAudit} onNavigate={setActiveTab} />}
      {activeTab === 'upload' && (
        <UploadView audit={activeAudit} onComplete={() => setActiveTab('analysis')} updateAudit={updateAudit} />
      )}
      {activeTab === 'analysis' && <AnalysisView audit={activeAudit} onNavigate={setActiveTab} />}
      {activeTab === 'ai-assistant' && <AIAssistantView audit={activeAudit} onNavigate={setActiveTab} />}
      {activeTab === 'reports' && <ReportsView audit={activeAudit} />}
    </DashboardLayout>
  );
};
