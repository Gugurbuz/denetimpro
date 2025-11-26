/*
  # DenetimPro Audit System Schema

  ## Overview
  Complete database schema for the Turkish audit management system with AI integration.

  ## New Tables
  
  ### 1. `profiles`
  User profile extensions linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text, user's full name)
  - `subscription_tier` (text, one of: 'free', 'pro_10', 'pro_25', 'pro_50', 'pro_100', 'enterprise')
  - `monthly_audits_used` (integer, tracking usage)
  - `monthly_token_limit` (integer, AI token quota)
  - `monthly_tokens_used` (integer, current usage)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `audits`
  Main audit records
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text, company name)
  - `period` (text, audit period like "Ocak 2024")
  - `status` (text, one of: 'draft', 'active', 'completed', 'archived')
  - `data_loaded` (boolean, whether data has been analyzed)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `audit_issues`
  Risk findings and issues detected
  - `id` (uuid, primary key)
  - `audit_id` (uuid, references audits)
  - `type` (text, 'Kritik', 'Uyarı', 'Bilgi')
  - `category` (text, issue category)
  - `description` (text, full description)
  - `amount` (numeric, monetary amount)
  - `detail` (text, additional context)
  - `ai_explanation` (text, Gemini's analysis)
  - `created_at` (timestamptz)

  ### 4. `audit_transactions`
  Individual transaction records from journal entries
  - `id` (uuid, primary key)
  - `audit_id` (uuid, references audits)
  - `transaction_date` (date)
  - `description` (text)
  - `debit` (numeric)
  - `credit` (numeric)
  - `account_type` (text, like '100 Kasa')
  - `balance` (numeric, running balance)
  - `ai_analysis` (text, AI analysis of transaction)
  - `created_at` (timestamptz)

  ### 5. `chat_messages`
  AI assistant conversation history
  - `id` (uuid, primary key)
  - `audit_id` (uuid, references audits)
  - `role` (text, 'user' or 'ai')
  - `content` (text, message content)
  - `created_at` (timestamptz)

  ### 6. `report_content`
  Audit report drafts with versioning
  - `id` (uuid, primary key)
  - `audit_id` (uuid, references audits)
  - `content` (text, markdown report content)
  - `version` (integer, version number)
  - `is_current` (boolean, latest version flag)
  - `created_at` (timestamptz)

  ### 7. `penalty_analyses`
  VUK penalty simulation results
  - `id` (uuid, primary key)
  - `audit_id` (uuid, references audits)
  - `analysis_content` (text, AI-generated penalty report)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro_10', 'pro_25', 'pro_50', 'pro_100', 'enterprise')),
  monthly_audits_used integer NOT NULL DEFAULT 0,
  monthly_token_limit integer NOT NULL DEFAULT 100000,
  monthly_tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Audits table
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  data_loaded boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON audits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own audits"
  ON audits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own audits"
  ON audits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own audits"
  ON audits FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Audit issues table
CREATE TABLE IF NOT EXISTS audit_issues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Kritik', 'Uyarı', 'Bilgi')),
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  detail text,
  ai_explanation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view issues for own audits"
  ON audit_issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_issues.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues for own audits"
  ON audit_issues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_issues.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update issues for own audits"
  ON audit_issues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_issues.audit_id
      AND audits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_issues.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- 4. Audit transactions table
CREATE TABLE IF NOT EXISTS audit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  description text NOT NULL,
  debit numeric NOT NULL DEFAULT 0,
  credit numeric NOT NULL DEFAULT 0,
  account_type text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  ai_analysis text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions for own audits"
  ON audit_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_transactions.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions for own audits"
  ON audit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = audit_transactions.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- 5. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'ai')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for own audits"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = chat_messages.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for own audits"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = chat_messages.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- 6. Report content table
CREATE TABLE IF NOT EXISTS report_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE report_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for own audits"
  ON report_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = report_content.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports for own audits"
  ON report_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = report_content.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports for own audits"
  ON report_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = report_content.audit_id
      AND audits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = report_content.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- 7. Penalty analyses table
CREATE TABLE IF NOT EXISTS penalty_analyses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  analysis_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE penalty_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view penalty analyses for own audits"
  ON penalty_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = penalty_analyses.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create penalty analyses for own audits"
  ON penalty_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      WHERE audits.id = penalty_analyses.audit_id
      AND audits.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_audit_id ON audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_transactions_audit_id ON audit_transactions(audit_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_audit_id ON chat_messages(audit_id);
CREATE INDEX IF NOT EXISTS idx_report_content_audit_id ON report_content(audit_id);
CREATE INDEX IF NOT EXISTS idx_penalty_analyses_audit_id ON penalty_analyses(audit_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();