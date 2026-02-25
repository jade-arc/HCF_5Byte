import { getSupabase } from '@/lib/supabase';

export interface TransactionInput {
  date: string;
  merchant: string;
  category: string;
  amount: number;
  transactionType: 'income' | 'expense' | 'transfer';
  description?: string;
  source?: string;
}

export interface UserTransaction extends TransactionInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add a transaction for the user
 */
export async function addTransaction(
  userId: string,
  transaction: TransactionInput
): Promise<UserTransaction> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_transactions')
    .insert({
      user_id: userId,
      date: transaction.date,
      merchant: transaction.merchant,
      category: transaction.category,
      amount: transaction.amount,
      transaction_type: transaction.transactionType,
      description: transaction.description,
      source: transaction.source || 'manual',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add transaction: ${error.message}`);

  return mapTransaction(data);
}

/**
 * Add multiple transactions (batch)
 */
export async function addTransactionsBatch(
  userId: string,
  transactions: TransactionInput[]
): Promise<UserTransaction[]> {
  const supabase = getSupabase();

  const data_to_insert = transactions.map((t) => ({
    user_id: userId,
    date: t.date,
    merchant: t.merchant,
    category: t.category,
    amount: t.amount,
    transaction_type: t.transactionType,
    description: t.description,
    source: t.source || 'manual',
  }));

  const { data, error } = await supabase
    .from('user_transactions')
    .insert(data_to_insert)
    .select();

  if (error) throw new Error(`Failed to add transactions: ${error.message}`);

  return (data || []).map(mapTransaction);
}

/**
 * Get user transactions
 */
export async function getUserTransactions(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
  }
): Promise<UserTransaction[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('user_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

  return (data || []).map(mapTransaction);
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<TransactionInput>
): Promise<UserTransaction> {
  const supabase = getSupabase();

  const updateData: Record<string, any> = {};

  if (updates.date) updateData.date = updates.date;
  if (updates.merchant) updateData.merchant = updates.merchant;
  if (updates.category) updateData.category = updates.category;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.transactionType) updateData.transaction_type = updates.transactionType;
  if (updates.description !== undefined) updateData.description = updates.description;

  const { data, error } = await supabase
    .from('user_transactions')
    .update(updateData)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update transaction: ${error.message}`);

  return mapTransaction(data);
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('user_transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
}

/**
 * Delete transactions in date range
 */
export async function deleteTransactionsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from('user_transactions')
    .delete()
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw new Error(`Failed to delete transactions: ${error.message}`);

  return count || 0;
}

/**
 * Get spending summary by category
 */
export async function getSpendingSummary(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = getSupabase();

  let query = supabase
    .from('user_transactions')
    .select('category, amount, transaction_type')
    .eq('user_id', userId);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch spending summary: ${error.message}`);

  const summary: Record<string, { spent: number; income: number }> = {};

  (data || []).forEach((transaction) => {
    const cat = transaction.category || 'Uncategorized';
    if (!summary[cat]) {
      summary[cat] = { spent: 0, income: 0 };
    }

    if (transaction.transaction_type === 'income') {
      summary[cat].income += transaction.amount;
    } else if (transaction.transaction_type === 'expense') {
      summary[cat].spent += transaction.amount;
    }
  });

  return summary;
}

/**
 * Helper to map database transaction to interface
 */
function mapTransaction(data: any): UserTransaction {
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    merchant: data.merchant,
    category: data.category,
    amount: data.amount,
    transactionType: data.transaction_type as 'income' | 'expense' | 'transfer',
    description: data.description,
    source: data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
