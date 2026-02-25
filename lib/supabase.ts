import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance (lazy loading for build time compatibility)
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
}

/**
 * Export for backward compatibility - use getSupabase() in new code
 */
export const supabase = {
  from: (table: string) => {
    return getSupabase().from(table);
  },
} as any;

// Database types
export interface User {
  id: string;
  phone_number: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  risk_profile: "conservative" | "moderate" | "aggressive";
  notification_preferences: Record<string, boolean>;
  auth_status: "unverified" | "verified" | "active";
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type: "checking" | "savings" | "investment" | "credit";
  account_name: string;
  current_balance: number;
  idle_capital: number;
  last_synced: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  raw_sms_text: string;
  parsed_amount: number;
  parsed_date: string;
  merchant_name?: string;
  category?: string;
  transaction_type: "debit" | "credit" | "transfer" | "fee";
  confidence_score: number;
  is_categorized: boolean;
  created_at: string;
}

export interface RiskScore {
  id: string;
  user_id: string;
  calculation_date: string;
  monthly_spending: number;
  spending_volatility: number;
  idle_capital_ratio: number;
  income_stability: number;
  overall_risk_score: number;
  risk_profile: "conservative" | "moderate" | "aggressive";
  rebalance_recommended: boolean;
  volatility_status: "normal" | "elevated" | "warning" | "breach";
  explanation: string;
  created_at: string;
}

export interface PortfolioAllocation {
  id: string;
  user_id: string;
  allocation_date: string;
  traditional_allocation_pct: number;
  longevity_allocation_pct: number;
  portfolio_value_usd: number;
  is_active: boolean;
  rebalance_threshold: number;
  volatility_threshold: number;
  last_rebalance?: string;
  created_at: string;
  updated_at: string;
}

export interface TraditionalAsset {
  id: string;
  allocation_id: string;
  user_id: string;
  asset_type: string;
  asset_symbol?: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  allocation_pct: number;
  volatility_score: number;
  is_active: boolean;
  updated_at: string;
}

export interface LongevityAsset {
  id: string;
  allocation_id: string;
  user_id: string;
  asset_name: string;
  asset_type: "staking" | "yield_farming" | "lending" | "insurance";
  initial_investment: number;
  current_value: number;
  apy: number;
  allocation_pct: number;
  contract_address?: string;
  lock_period_days?: number;
  is_active: boolean;
  updated_at: string;
}

export interface RebalanceHistory {
  id: string;
  user_id: string;
  rebalance_date: string;
  trigger_reason:
    | "drift"
    | "risk_change"
    | "user_request"
    | "volatility"
    | "scheduled";
  old_allocation: Record<string, unknown>;
  new_allocation: Record<string, unknown>;
  volatility_threshold_breached: boolean;
  changes: Record<string, unknown>;
  success: boolean;
  created_at: string;
}

export interface IdleCapitalLog {
  id: string;
  user_id: string;
  account_id?: string;
  detected_at: string;
  idle_amount: number;
  idle_duration_days: number;
  allocation_recommendation?: string;
  is_addressed: boolean;
  addressed_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  risk_governance_check_passed: boolean;
  ip_address?: string;
  created_at: string;
}

/**
 * Save a transaction to the database
 */
export async function saveTransaction(
  userId: string,
  transaction: {
    raw_sms_text: string;
    parsed_amount: number;
    parsed_date: string;
    merchant_name?: string;
    category?: string;
    transaction_type: "debit" | "credit" | "transfer" | "fee";
    confidence_score: number;
  }
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: userId,
        ...transaction,
        is_categorized: !!transaction.category,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Save risk score calculation
 */
export async function saveRiskScore(
  userId: string,
  riskData: Omit<RiskScore, "id" | "user_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("risk_scores")
    .insert([
      {
        user_id: userId,
        ...riskData,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Get latest risk score for a user
 */
export async function getLatestRiskScore(
  userId: string
): Promise<RiskScore | null> {
  const { data, error } = await supabase
    .from("risk_scores")
    .select("*")
    .eq("user_id", userId)
    .order("calculation_date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * Get user transactions within date range
 */
export async function getUserTransactions(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("parsed_date", { ascending: false });

  if (startDate) {
    query = query.gte("parsed_date", startDate);
  }

  if (endDate) {
    query = query.lte("parsed_date", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Save portfolio allocation
 */
export async function savePortfolioAllocation(
  userId: string,
  allocationData: Omit<
    PortfolioAllocation,
    "id" | "user_id" | "created_at" | "updated_at"
  >
) {
  const { data, error } = await supabase
    .from("portfolio_allocations")
    .insert([
      {
        user_id: userId,
        ...allocationData,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Get active portfolio for user
 */
export async function getUserPortfolio(
  userId: string
): Promise<PortfolioAllocation | null> {
  const { data, error } = await supabase
    .from("portfolio_allocations")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("allocation_date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * Save rebalance action
 */
export async function saveRebalanceHistory(
  userId: string,
  historyData: Omit<RebalanceHistory, "id" | "user_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("rebalance_history")
    .insert([
      {
        user_id: userId,
        ...historyData,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Save idle capital detection
 */
export async function saveIdleCapitalLog(
  userId: string,
  logData: Omit<IdleCapitalLog, "id" | "user_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("idle_capital_logs")
    .insert([
      {
        user_id: userId,
        ...logData,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  userId: string,
  auditData: Omit<AuditLog, "id" | "user_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert([
      {
        user_id: userId,
        ...auditData,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}
