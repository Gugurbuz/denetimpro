import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutGrid,
  UploadCloud,
  Activity,
  Sparkles,
  FileText,
  Plus,
  Briefcase,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  Search,
  FolderOpen,
} from 'lucide-react';
import type { Database } from '../../lib/supabase';

type Audit = Database['public']['Tables']['audits']['Row'];
type TabType = 'dashboard' | 'upload' | 'analysis' | 'ai-assistant' | 'reports';

interface DashboardLayoutProps {
  audits: Audit[];
  activeAuditId: string | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAuditChange: (id: string) => void;
  onCreateAudit: () => void;
  onDeleteAudit: (id: string) => void;
  onLogout: () => void;
  activeAudit?: Audit;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  audits,
  activeAuditId,
  activeTab,
  onTabChange,
  onAuditChange,
  onCreateAudit,
  onDeleteAudit,
  onLogout,
  activeAudit,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const NavItem: React.FC<{
    id: TabType;
    icon: React.ElementType;
    label: string;
    badge?: number;
    isNew?: boolean;
  }> = ({ id, icon: Icon, label, badge, isNew }) => (
    <button
      onClick={() => onTabChange(id)}
      className={`relative group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full
        ${
          activeTab === id
            ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
            : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
        }
        ${isSidebarCollapsed ? 'justify-center' : ''}
      `}
      title={isSidebarCollapsed ? label : ''}
    >
      <Icon
        size={20}
        className={`${
          activeTab === id ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-600'
        } transition-colors`}
      />
      {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
      {!isSidebarCollapsed && isNew && (
        <span className="absolute right-2 top-3.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      )}
      {!isSidebarCollapsed && badge && badge > 0 && (
        <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px] font-bold">
          {badge}
        </span>
      )}
      {isSidebarCollapsed && badge && badge > 0 && (
        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-50"></span>
      )}
    </button>
  );

  const AuditListItem: React.FC<{ audit: Audit; isActive: boolean }> = ({ audit, isActive }) => (
    <div
      onClick={() => onAuditChange(audit.id)}
      className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border mb-2
        ${
          isActive
            ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
            : 'hover:bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
        }
        ${isSidebarCollapsed ? 'justify-center' : ''}
      `}
    >
      <div
        className={`p-2 rounded-lg shrink-0 transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
        }`}
      >
        <Briefcase size={18} />
      </div>
      {!isSidebarCollapsed && (
        <div className="min-w-0 flex-1">
          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
            {audit.name}
          </h4>
          <p className="text-[10px] text-slate-400 truncate">{audit.period}</p>
        </div>
      )}
      {!isSidebarCollapsed && audits.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAudit(audit.id);
          }}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-slate-200 bg-[#F8FAFC] relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-slate-200 p-1 rounded-full shadow-md text-slate-400 hover:text-blue-600 z-50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div
          className={`p-6 flex items-center ${
            isSidebarCollapsed ? 'justify-center' : 'justify-start'
          } transition-all cursor-pointer`}
          onClick={onLogout}
        >
          <div className="h-10 w-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-300 shrink-0 text-white">
            <ShieldCheck size={22} />
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">
                Denetim<span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                YMM Portal v9.0
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-6">
          {/* Audits */}
          <div>
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Dosyalar
                </span>
                <button
                  onClick={onCreateAudit}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
            <div className="space-y-1">
              {audits.map((audit) => (
                <AuditListItem key={audit.id} audit={audit} isActive={activeAuditId === audit.id} />
              ))}
              {isSidebarCollapsed && (
                <button
                  onClick={onCreateAudit}
                  className="w-full p-2 flex justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            {!isSidebarCollapsed && (
              <div className="mb-2 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Çalışma Alanı
                </span>
              </div>
            )}
            <div className="space-y-1">
              <NavItem id="dashboard" icon={LayoutGrid} label="Panel" />
              <NavItem id="upload" icon={UploadCloud} label="Veri Kaynağı" />
              <NavItem id="analysis" icon={Activity} label="Risk Analizi" />
              <NavItem id="ai-assistant" icon={Sparkles} label="AI Asistanı" isNew />
              <NavItem id="reports" icon={FileText} label="Akıllı Editör" isNew />
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="p-4">
          {!isSidebarCollapsed ? (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 relative overflow-hidden group cursor-pointer">
              <div className="absolute -right-2 -top-2 opacity-20 group-hover:opacity-30 transition-opacity">
                <Zap size={60} />
              </div>
              <p className="text-[10px] font-medium text-blue-100 mb-1">PREMIUM</p>
              <h4 className="font-bold text-sm mb-2">Sınırsız Analiz</h4>
              <button className="bg-white/20 backdrop-blur-sm text-xs py-1.5 px-3 rounded-lg hover:bg-white/30 transition w-full border border-white/10">
                Yükselt
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition">
                <Zap size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50/50">
        {/* Header */}
        {activeTab !== 'reports' && (
          <header className="h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm text-slate-500">
                <FolderOpen size={16} className="mr-2" />
                <span className="font-medium text-slate-800">{activeAudit?.name || 'Denetim Seçilmedi'}</span>
                <span className="mx-2 text-slate-300">/</span>
                <span>
                  {activeTab === 'dashboard' && 'Genel Bakış'}
                  {activeTab === 'upload' && 'Veri Yükleme'}
                  {activeTab === 'analysis' && 'Risk & Fiş Analizi'}
                  {activeTab === 'ai-assistant' && 'Gemini Asistan'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group hidden md:block">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Fiş, Tutar veya Hesap Ara..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64 transition-all"
                />
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              <button
                onClick={onLogout}
                className="h-9 w-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white cursor-pointer hover:scale-105 transition-transform"
              >
                YM
              </button>
            </div>
          </header>
        )}

        <main className={`flex-1 overflow-y-auto ${activeTab !== 'reports' ? 'p-8' : ''} scroll-smooth`}>
          {children}
        </main>
      </div>
    </div>
  );
};
