import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeTransactions,
  calculateSpendingTrend,
  identifyRecurringTransactions,
  suggestBudgets,
} from '@/lib/services/transaction-analyzer';
import { getUserTransactions } from '@/lib/supabase';

// Prevent static generation for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/analysis/transactions
 * Analyze transaction history for patterns and insights
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, monthsToAnalyze = 6 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Fetch transactions for the specified period
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToAnalyze);

    const transactions = await getUserTransactions(
      userId,
      startDate.toISOString()
    );

    // Convert to analysis format
    const formattedTransactions = transactions.map((t: any) => ({
      id: t.id,
      amount: t.parsed_amount,
      date: new Date(t.parsed_date),
      category: t.category || 'other',
      type: t.transaction_type,
      merchant: t.merchant_name,
    }));

    // Perform analysis
    const analysis = analyzeTransactions(formattedTransactions);

    // Calculate monthly spending for trend
    const monthlySpending = new Map<string, number>();
    formattedTransactions.forEach((t: any) => {
      if (t.type === 'debit' && t.category !== 'transfer') {
        const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        monthlySpending.set(key, (monthlySpending.get(key) || 0) + t.amount);
      }
    });

    const spendingTrend = calculateSpendingTrend(monthlySpending);
    const recurring = identifyRecurringTransactions(formattedTransactions);
    const budgets = suggestBudgets(analysis.spendingByCategory);

    return NextResponse.json({
      success: true,
      analysis,
      spendingTrend,
      recurring,
      budgets,
      summary: {
        period: `${monthsToAnalyze} months`,
        totalTransactions: analysis.totalTransactions,
        totalSpending: analysis.totalSpending,
        totalIncome: analysis.totalIncome,
        netCashFlow: analysis.netCashFlow,
        averageMonthlySpending:
          analysis.totalSpending / monthsToAnalyze,
        topCategory:
          analysis.spendingByCategory[0]?.category || 'N/A',
        topMerchant:
          analysis.merchantFrequency[0]?.merchant || 'N/A',
      },
    });
  } catch (error) {
    console.error('[v0] Transaction analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze transactions',
      },
      { status: 500 }
    );
  }
}
