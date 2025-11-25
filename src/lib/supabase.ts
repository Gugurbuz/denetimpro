import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          subscription_tier: 'free' | 'pro_10' | 'pro_25' | 'pro_50' | 'pro_100' | 'enterprise';
          monthly_audits_used: number;
          monthly_token_limit: number;
          monthly_tokens_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          subscription_tier?: 'free' | 'pro_10' | 'pro_25' | 'pro_50' | 'pro_100' | 'enterprise';
          monthly_audits_used?: number;
          monthly_token_limit?: number;
          monthly_tokens_used?: number;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      audits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          period: string;
          status: 'draft' | 'active' | 'completed' | 'archived';
          data_loaded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          period: string;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          data_loaded?: boolean;
        };
        Update: Partial<Database['public']['Tables']['audits']['Insert']>;
      };
      audit_issues: {
        Row: {
          id: string;
          audit_id: string;
          type: 'Kritik' | 'Uyarı' | 'Bilgi';
          category: string;
          description: string;
          amount: number;
          detail: string | null;
          ai_explanation: string | null;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          type: 'Kritik' | 'Uyarı' | 'Bilgi';
          category: string;
          description: string;
          amount: number;
          detail?: string;
          ai_explanation?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_issues']['Insert']>;
      };
      audit_transactions: {
        Row: {
          id: string;
          audit_id: string;
          transaction_date: string;
          description: string;
          debit: number;
          credit: number;
          account_type: string;
          balance: number;
          ai_analysis: string | null;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          transaction_date: string;
          description: string;
          debit?: number;
          credit?: number;
          account_type: string;
          balance?: number;
          ai_analysis?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_transactions']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          audit_id: string;
          role: 'user' | 'ai';
          content: string;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          role: 'user' | 'ai';
          content: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      report_content: {
        Row: {
          id: string;
          audit_id: string;
          content: string;
          version: number;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          content?: string;
          version?: number;
          is_current?: boolean;
        };
        Update: Partial<Database['public']['Tables']['report_content']['Insert']>;
      };
      penalty_analyses: {
        Row: {
          id: string;
          audit_id: string;
          analysis_content: string;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          analysis_content: string;
        };
        Update: Partial<Database['public']['Tables']['penalty_analyses']['Insert']>;
      };
    };
  };
};
