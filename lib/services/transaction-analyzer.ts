/**
 * Transaction Analyzer
 * Analyzes transaction patterns for insights and anomalies
 */

interface Transaction {
  id?: string;
  amount: number;
  date: Date;
  category: string;
  type: 'debit' | 'credit' | 'transfer' | 'fee';
  merchant?: string;
}

interface CategorySpending {
  category: string;
  total: number;
  count: number;
  percentage: number;
  averageTransaction: number;
}

interface TransactionAnalysis {
  totalTransactions: number;
  dateRange: { start: Date; end: Date };
  totalSpending: number;
  totalIncome: number;
  netCashFlow: number;
  averageTransaction: number;
  largestTransaction: { amount: number; merchant?: string; date: Date };
  spendingByCategory: CategorySpending[];
  anomalies: TransactionAnomaly[];
  merchantFrequency: { merchant: string; count: number }[];
}

interface TransactionAnomaly {
  type: 'high_value' | 'unusual_category' | 'rapid_succession' | 'weekend_spending';
  severity: 'low' | 'medium' | 'high';
  description: string;
  transaction: Transaction;
}

/**
 * Analyze transaction patterns
 */
export function analyzeTransactions(transactions: Transaction[]): TransactionAnalysis {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      dateRange: { start: new Date(), end: new Date() },
      totalSpending: 0,
      totalIncome: 0,
      netCashFlow: 0,
      averageTransaction: 0,
      largestTransaction: { amount: 0, date: new Date() },
      spendingByCategory: [],
      anomalies: [],
      merchantFrequency: [],
    };
  }

  // Sort by date
  const sorted = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Calculate basics
  const dateRange = {
    start: sorted[0].date,
    end: sorted[sorted.length - 1].date,
  };

  const totalSpending = sorted
    .filter((t) => t.type === 'debit' && t.category !== 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = sorted
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalSpending;
  const averageTransaction =
    sorted.length > 0
      ? sorted.reduce((sum, t) => sum + t.amount, 0) / sorted.length
      : 0;

  // Find largest transaction
  const largestTransaction =
    sorted.reduce((max, t) => (t.amount > max.amount ? t : max)) ||
    sorted[0];

  // Category analysis
  const categoryMap = new Map<string, Transaction[]>();
  sorted.forEach((t) => {
    if (t.type === 'debit' && t.category !== 'transfer') {
      const cat = categoryMap.get(t.category) || [];
      cat.push(t);
      categoryMap.set(t.category, cat);
    }
  });

  const spendingByCategory: CategorySpending[] = Array.from(
    categoryMap.entries()
  ).map(([category, items]) => {
    const total = items.reduce((sum, t) => sum + t.amount, 0);
    return {
      category,
      total,
      count: items.length,
      percentage: (total / totalSpending) * 100,
      averageTransaction: total / items.length,
    };
  });

  // Sort by spending
  spendingByCategory.sort((a, b) => b.total - a.total);

  // Merchant frequency
  const merchantMap = new Map<string, number>();
  sorted.forEach((t) => {
    if (t.merchant) {
      merchantMap.set(t.merchant, (merchantMap.get(t.merchant) || 0) + 1);
    }
  });

  const merchantFrequency = Array.from(merchantMap.entries())
    .map(([merchant, count]) => ({ merchant, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Detect anomalies
  const anomalies = detectAnomalies(sorted, spendingByCategory);

  return {
    totalTransactions: sorted.length,
    dateRange,
    totalSpending,
    totalIncome,
    netCashFlow,
    averageTransaction,
    largestTransaction,
    spendingByCategory,
    anomalies,
    merchantFrequency,
  };
}

/**
 * Detect transaction anomalies
 */
function detectAnomalies(
  transactions: Transaction[],
  categoryStats: CategorySpending[]
): TransactionAnomaly[] {
  const anomalies: TransactionAnomaly[] = [];

  // Get average and std dev for detecting outliers
  const amounts = transactions.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      amounts.length
  );

  transactions.forEach((t) => {
    // High value detection (> mean + 2*stdDev)
    if (t.amount > mean + 2 * stdDev && t.type === 'debit') {
      anomalies.push({
        type: 'high_value',
        severity: t.amount > mean + 3 * stdDev ? 'high' : 'medium',
        description: `Unusually high transaction: $${t.amount.toFixed(2)} (avg: $${mean.toFixed(2)})`,
        transaction: t,
      });
    }

    // Unusual category detection (rare category usage)
    const catStat = categoryStats.find((c) => c.category === t.category);
    if (catStat && catStat.count === 1 && t.type === 'debit') {
      anomalies.push({
        type: 'unusual_category',
        severity: 'low',
        description: `First transaction in category: ${t.category}`,
        transaction: t,
      });
    }

    // Weekend spending detection
    if (t.type === 'debit' && t.category !== 'transfer') {
      const day = t.date.getDay();
      if (day === 0 || day === 6) {
        // Saturday or Sunday
        anomalies.push({
          type: 'weekend_spending',
          severity: 'low',
          description: `Weekend transaction: $${t.amount.toFixed(2)}`,
          transaction: t,
        });
      }
    }
  });

  // Detect rapid succession (multiple transactions within 5 minutes)
  for (let i = 0; i < transactions.length - 1; i++) {
    const current = transactions[i];
    const next = transactions[i + 1];
    const timeDiff = Math.abs(
      next.date.getTime() - current.date.getTime()
    );

    if (timeDiff < 5 * 60 * 1000) {
      // 5 minutes
      anomalies.push({
        type: 'rapid_succession',
        severity: 'low',
        description: `Rapid transaction: ${timeDiff / 1000}s apart`,
        transaction: current,
      });
    }
  }

  return anomalies.slice(0, 20); // Limit to top 20 anomalies
}

/**
 * Calculate spending trends (linear regression)
 */
export function calculateSpendingTrend(
  monthlySpending: Map<string, number>
): {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  projection: number;
} {
  const entries = Array.from(monthlySpending.entries());

  if (entries.length < 2) {
    return { trend: 'stable', slope: 0, projection: 0 };
  }

  // Simple linear regression
  const n = entries.length;
  const x = entries.map((_, i) => i);
  const y = entries.map((e) => e[1]);

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  const slope =
    x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0) /
    x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

  const intercept = yMean - slope * xMean;
  const projection = slope * n + intercept;

  const trend =
    slope > 50
      ? 'increasing'
      : slope < -50
        ? 'decreasing'
        : 'stable';

  return { trend, slope, projection };
}

/**
 * Identify recurring transactions (subscriptions, etc.)
 */
export function identifyRecurringTransactions(
  transactions: Transaction[],
  minOccurrences: number = 3
): {
  merchant: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  count: number;
}[] {
  const merchantMap = new Map<
    string,
    { amounts: number[]; dates: Date[] }
  >();

  transactions.forEach((t) => {
    if (t.merchant && t.type === 'debit') {
      const entry = merchantMap.get(t.merchant) || { amounts: [], dates: [] };
      entry.amounts.push(t.amount);
      entry.dates.push(t.date);
      merchantMap.set(t.merchant, entry);
    }
  });

  const recurring = [];

  merchantMap.forEach((value, merchant) => {
    if (
      value.amounts.length >= minOccurrences &&
      value.amounts.every((a) => Math.abs(a - value.amounts[0]) < 0.01)
    ) {
      // Same amount each time
      const dates = value.dates.sort(
        (a, b) => a.getTime() - b.getTime()
      );
      const intervals: number[] = [];

      for (let i = 1; i < dates.length; i++) {
        const diff = Math.floor(
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        );
        intervals.push(diff);
      }

      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      let frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';

      if (avgInterval < 2) frequency = 'daily';
      else if (avgInterval < 10) frequency = 'weekly';
      else if (avgInterval < 35) frequency = 'monthly';
      else frequency = 'irregular';

      recurring.push({
        merchant,
        amount: value.amounts[0],
        frequency,
        count: value.amounts.length,
      });
    }
  });

  return recurring;
}

/**
 * Calculate category budgets based on historical spending
 */
export function suggestBudgets(
  spendingByCategory: CategorySpending[]
): { category: string; suggestedBudget: number }[] {
  return spendingByCategory.map((cat) => ({
    category: cat.category,
    suggestedBudget: Math.ceil(cat.total * 1.15), // Add 15% buffer
  }));
}
