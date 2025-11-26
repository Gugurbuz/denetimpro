import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Audit = Database['public']['Tables']['audits']['Row'];

export const useAudits = (userId: string | undefined) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAudits = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAudits(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('audits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audits',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAudits((prev) => [payload.new as Audit, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAudits((prev) =>
              prev.map((audit) =>
                audit.id === payload.new.id ? (payload.new as Audit) : audit
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAudits((prev) => prev.filter((audit) => audit.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const createAudit = async (name: string, period: string) => {
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_id: userId,
        name,
        period,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateAudit = async (id: string, updates: Partial<Audit>) => {
    const { data, error } = await supabase
      .from('audits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteAudit = async (id: string) => {
    const { error } = await supabase.from('audits').delete().eq('id', id);

    if (error) throw error;
  };

  return {
    audits,
    loading,
    error,
    createAudit,
    updateAudit,
    deleteAudit,
  };
};
