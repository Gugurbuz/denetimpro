import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateDemoData, analyzeData, type AnalysisResult, type JournalEntry } from '../lib/demoData';

export const useAuditAnalysis = (auditId: string | null) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDemoData = async (auditId: string) => {
    setLoading(true);
    setError(null);

    try {
      const demoEntries = generateDemoData();
      const analysisResult = analyzeData(demoEntries);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      for (const entry of demoEntries) {
        const { data: entryData, error: entryError } = await supabase
          .from('journal_entries')
          .insert({
            audit_id: auditId,
            entry_date: entry.date,
            description: entry.description,
            reference: entry.reference,
          })
          .select()
          .single();

        if (entryError) throw entryError;

        for (const line of entry.lines) {
          const { error: lineError } = await supabase.from('journal_lines').insert({
            entry_id: entryData.id,
            account_code: line.accountCode,
            account_name: line.accountName,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
          });

          if (lineError) throw lineError;
        }
      }

      for (const finding of analysisResult.riskFindings) {
        const { error: findingError } = await supabase.from('risk_findings').insert({
          audit_id: auditId,
          severity: finding.severity,
          type: finding.type,
          title: finding.title,
          description: finding.description,
          amount: finding.amount || null,
          account_code: finding.accountCode || null,
          finding_date: finding.date || null,
          penalty_risk: finding.penaltyRisk || null,
        });

        if (findingError) throw findingError;
      }

      for (const account of analysisResult.accountSummary) {
        const { error: accountError } = await supabase.from('account_summary').insert({
          audit_id: auditId,
          account_code: account.code,
          account_name: account.name,
          total_debit: account.debit,
          total_credit: account.credit,
          balance: account.balance,
          entry_count: account.entryCount,
        });

        if (accountError) throw accountError;
      }

      setEntries(demoEntries);
      setAnalysis(analysisResult);
    } catch (err) {
      console.error('Failed to load demo data:', err);
      setError('Demo veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (auditId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [entriesRes, findingsRes, accountsRes] = await Promise.all([
        supabase
          .from('journal_entries')
          .select('*, journal_lines(*)')
          .eq('audit_id', auditId)
          .order('entry_date'),
        supabase.from('risk_findings').select('*').eq('audit_id', auditId),
        supabase.from('account_summary').select('*').eq('audit_id', auditId).order('balance', { ascending: false }),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (findingsRes.error) throw findingsRes.error;
      if (accountsRes.error) throw accountsRes.error;

      const journalEntries: JournalEntry[] = entriesRes.data.map((e: any) => ({
        id: e.id,
        date: e.entry_date,
        description: e.description,
        reference: e.reference,
        lines: e.journal_lines.map((l: any) => ({
          accountCode: l.account_code,
          accountName: l.account_name,
          debit: parseFloat(l.debit),
          credit: parseFloat(l.credit),
          description: l.description,
        })),
      }));

      const totalDebit = accountsRes.data.reduce((sum, a) => sum + parseFloat(a.total_debit), 0);
      const totalCredit = accountsRes.data.reduce((sum, a) => sum + parseFloat(a.total_credit), 0);

      const dates = entriesRes.data.map((e: any) => e.entry_date).sort();
      const dateRange = { start: dates[0] || '', end: dates[dates.length - 1] || '' };

      const cashAccount = accountsRes.data.find((a) => a.account_code === '100');
      const revenueAccount = accountsRes.data.find((a) => a.account_code === '600');
      const expenseAccount = accountsRes.data.find((a) => a.account_code === '770');

      setEntries(journalEntries);
      setAnalysis({
        totalEntries: entriesRes.data.length,
        totalDebit,
        totalCredit,
        dateRange,
        riskFindings: findingsRes.data.map((f: any) => ({
          id: f.id,
          severity: f.severity,
          type: f.type,
          title: f.title,
          description: f.description,
          amount: f.amount ? parseFloat(f.amount) : undefined,
          accountCode: f.account_code,
          date: f.finding_date,
          penaltyRisk: f.penalty_risk ? parseFloat(f.penalty_risk) : undefined,
        })),
        accountSummary: accountsRes.data.map((a: any) => ({
          code: a.account_code,
          name: a.account_name,
          debit: parseFloat(a.total_debit),
          credit: parseFloat(a.total_credit),
          balance: parseFloat(a.balance),
          entryCount: a.entry_count,
        })),
        keyMetrics: {
          cashBalance: cashAccount ? parseFloat(cashAccount.balance) : 0,
          totalRevenue: revenueAccount ? parseFloat(revenueAccount.total_credit) : 0,
          totalExpense: expenseAccount ? parseFloat(expenseAccount.total_debit) : 0,
          largestTransaction: 0,
          averageTransactionSize: 0,
          documentsWithoutSupport: 0,
        },
      });
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
      setError('Analiz verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auditId) {
      fetchAnalysis(auditId);
    }
  }, [auditId]);

  return {
    analysis,
    entries,
    loading,
    error,
    loadDemoData,
    refreshAnalysis: () => auditId && fetchAnalysis(auditId),
  };
};
