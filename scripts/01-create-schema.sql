-- AI-Powered Wealth Platform Schema
-- Comprehensive schema for transaction ingestion, risk analysis, and portfolio management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": false}',
  auth_status TEXT CHECK (auth_status IN ('unverified', 'verified', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_auth_status ON users(auth_status);

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'investment', 'credit')) NOT NULL,
  account_name TEXT NOT NULL,
  current_balance NUMERIC(15, 2) DEFAULT 0,
  idle_capital NUMERIC(15, 2) DEFAULT 0,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  raw_sms_text TEXT NOT NULL,
  parsed_amount NUMERIC(15, 2) NOT NULL,
  parsed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant_name TEXT,
  category TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('debit', 'credit', 'transfer', 'fee')) NOT NULL,
  confidence_score NUMERIC(3, 2) DEFAULT 0.95,
  is_categorized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(parsed_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- ============================================================================
-- RISK SCORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  monthly_spending NUMERIC(15, 2),
  spending_volatility NUMERIC(5, 2),
  idle_capital_ratio NUMERIC(5, 2),
  income_stability NUMERIC(5, 2),
  overall_risk_score NUMERIC(5, 2) CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  rebalance_recommended BOOLEAN DEFAULT false,
  volatility_status TEXT CHECK (volatility_status IN ('normal', 'elevated', 'warning', 'breach')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_scores_user_id ON risk_scores(user_id);
CREATE INDEX idx_risk_scores_date ON risk_scores(calculation_date DESC);

-- ============================================================================
-- PORTFOLIO ALLOCATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allocation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  traditional_allocation_pct NUMERIC(5, 2) CHECK (traditional_allocation_pct = 70),
  longevity_allocation_pct NUMERIC(5, 2) CHECK (longevity_allocation_pct = 30),
  portfolio_value_usd NUMERIC(15, 2),
  is_active BOOLEAN DEFAULT true,
  rebalance_threshold NUMERIC(5, 2) DEFAULT 5.0,
  volatility_threshold NUMERIC(5, 2) DEFAULT 25.0,
  last_rebalance TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_allocations_user_id ON portfolio_allocations(user_id);
CREATE INDEX idx_portfolio_allocations_active ON portfolio_allocations(is_active);

-- ============================================================================
-- TRADITIONAL ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS traditional_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_id UUID NOT NULL REFERENCES portfolio_allocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  asset_symbol TEXT,
  quantity NUMERIC(12, 4),
  purchase_price NUMERIC(12, 4),
  current_price NUMERIC(12, 4),
  allocation_pct NUMERIC(5, 2),
  volatility_score NUMERIC(5, 2),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_traditional_assets_allocation_id ON traditional_assets(allocation_id);
CREATE INDEX idx_traditional_assets_user_id ON traditional_assets(user_id);

-- ============================================================================
-- LONGEVITY ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS longevity_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_id UUID NOT NULL REFERENCES portfolio_allocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('staking', 'yield_farming', 'lending', 'insurance')),
  initial_investment NUMERIC(15, 2),
  current_value NUMERIC(15, 2),
  apy NUMERIC(5, 2),
  allocation_pct NUMERIC(5, 2),
  contract_address TEXT,
  lock_period_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_longevity_assets_allocation_id ON longevity_assets(allocation_id);
CREATE INDEX idx_longevity_assets_user_id ON longevity_assets(user_id);

-- ============================================================================
-- REBALANCE HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rebalance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rebalance_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  trigger_reason TEXT CHECK (trigger_reason IN ('drift', 'risk_change', 'user_request', 'volatility', 'scheduled')),
  old_allocation JSONB,
  new_allocation JSONB,
  volatility_threshold_breached BOOLEAN DEFAULT false,
  changes JSONB,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rebalance_history_user_id ON rebalance_history(user_id);
CREATE INDEX idx_rebalance_history_date ON rebalance_history(rebalance_date DESC);

-- ============================================================================
-- IDLE CAPITAL LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS idle_capital_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  idle_amount NUMERIC(15, 2),
  idle_duration_days INTEGER,
  allocation_recommendation TEXT,
  is_addressed BOOLEAN DEFAULT false,
  addressed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_idle_capital_logs_user_id ON idle_capital_logs(user_id);
CREATE INDEX idx_idle_capital_logs_addressed ON idle_capital_logs(is_addressed);

-- ============================================================================
-- AUDIT LOG TABLE (for compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  risk_governance_check_passed BOOLEAN,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE traditional_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE longevity_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE idle_capital_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: auth.uid() is built-in to Supabase and available in RLS policies

-- Users RLS policy
CREATE POLICY "Users can only access their own profile"
  ON users FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Accounts RLS policy
CREATE POLICY "Users can only access their own accounts"
  ON accounts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Transactions RLS policy
CREATE POLICY "Users can only access their own transactions"
  ON transactions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Risk scores RLS policy
CREATE POLICY "Users can only access their own risk scores"
  ON risk_scores FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Portfolio allocations RLS policy
CREATE POLICY "Users can only access their own portfolios"
  ON portfolio_allocations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Traditional assets RLS policy
CREATE POLICY "Users can only access their own assets"
  ON traditional_assets FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Longevity assets RLS policy
CREATE POLICY "Users can only access their own longevity assets"
  ON longevity_assets FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Rebalance history RLS policy
CREATE POLICY "Users can only access their own rebalance history"
  ON rebalance_history FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Idle capital logs RLS policy
CREATE POLICY "Users can only access their own idle capital logs"
  ON idle_capital_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Audit logs RLS policy
CREATE POLICY "Users can only access their own audit logs"
  ON audit_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SEED DATA FOR TESTING (optional, can be removed for production)
-- ============================================================================

-- Insert test user
INSERT INTO users (phone_number, email, first_name, last_name, risk_profile, auth_status)
VALUES (
  '+1234567890',
  'demo@wealthplatform.local',
  'Demo',
  'User',
  'moderate',
  'verified'
) ON CONFLICT (phone_number) DO NOTHING;
