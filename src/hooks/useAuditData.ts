import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type AuditIssue = Database['public']['Tables']['audit_issues']['Row'];
type AuditTransaction = Database['public']['Tables']['audit_transactions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export const useAuditIssues = (auditId: string | undefined) => {
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }

    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from('audit_issues')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setIssues(data);
      }
      setLoading(false);
    };

    fetchIssues();

    const subscription = supabase
      .channel(`issues_${auditId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_issues',
          filter: `audit_id=eq.${auditId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIssues((prev) => [...prev, payload.new as AuditIssue]);
          } else if (payload.eventType === 'UPDATE') {
            setIssues((prev) =>
              prev.map((issue) =>
                issue.id === payload.new.id ? (payload.new as AuditIssue) : issue
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [auditId]);

  const saveIssues = async (newIssues: Database['public']['Tables']['audit_issues']['Insert'][]) => {
    if (!auditId) return;

    const { error } = await supabase.from('audit_issues').insert(newIssues);
    if (error) throw error;
  };

  const updateIssueExplanation = async (issueId: string, explanation: string) => {
    const { error } = await supabase
      .from('audit_issues')
      .update({ ai_explanation: explanation })
      .eq('id', issueId);

    if (error) throw error;
  };

  return { issues, loading, saveIssues, updateIssueExplanation };
};

export const useAuditTransactions = (auditId: string | undefined) => {
  const [transactions, setTransactions] = useState<AuditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('audit_transactions')
        .select('*')
        .eq('audit_id', auditId)
        .order('transaction_date', { ascending: true });

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [auditId]);

  const saveTransactions = async (
    newTransactions: Database['public']['Tables']['audit_transactions']['Insert'][]
  ) => {
    if (!auditId) return;

    const { error } = await supabase.from('audit_transactions').insert(newTransactions);
    if (error) throw error;
  };

  const updateTransactionAnalysis = async (transactionId: string, analysis: string) => {
    const { error } = await supabase
      .from('audit_transactions')
      .update({ ai_analysis: analysis })
      .eq('id', transactionId);

    if (error) throw error;
  };

  return { transactions, loading, saveTransactions, updateTransactionAnalysis };
};

export const useChatMessages = (auditId: string | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages_${auditId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `audit_id=eq.${auditId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [auditId]);

  const addMessage = async (role: 'user' | 'ai', content: string) => {
    if (!auditId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({ audit_id: auditId, role, content });

    if (error) throw error;
  };

  return { messages, loading, addMessage };
};

export const useReportContent = (auditId: string | undefined) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      const { data, error } = await supabase
        .from('report_content')
        .select('*')
        .eq('audit_id', auditId)
        .eq('is_current', true)
        .single();

      if (!error && data) {
        setContent(data.content);
        setReportId(data.id);
      } else {
        // Create initial report
        const { data: newReport, error: insertError } = await supabase
          .from('report_content')
          .insert({ audit_id: auditId, content: '' })
          .select()
          .single();

        if (!insertError && newReport) {
          setReportId(newReport.id);
        }
      }
      setLoading(false);
    };

    fetchReport();
  }, [auditId]);

  const saveContent = async (newContent: string) => {
    if (!reportId) return;

    const { error } = await supabase
      .from('report_content')
      .update({ content: newContent })
      .eq('id', reportId);

    if (error) throw error;
    setContent(newContent);
  };

  return { content, loading, saveContent, setContent };
};

export const usePenaltyAnalysis = (auditId: string | undefined) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      const { data, error } = await supabase
        .from('penalty_analyses')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setAnalysis(data.analysis_content);
      }
      setLoading(false);
    };

    fetchAnalysis();
  }, [auditId]);

  const saveAnalysis = async (analysisContent: string) => {
    if (!auditId) return;

    const { error } = await supabase
      .from('penalty_analyses')
      .insert({ audit_id: auditId, analysis_content: analysisContent });

    if (error) throw error;
    setAnalysis(analysisContent);
  };

  return { analysis, loading, saveAnalysis };
};
