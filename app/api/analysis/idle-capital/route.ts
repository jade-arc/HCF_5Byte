import { NextRequest, NextResponse } from 'next/server';
import {
  analyzePortfolioIdleCapital,
  generateAllocationPlan,
} from '@/lib/services/idle-capital-detector';

// Prevent static generation for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/analysis/idle-capital
 * Analyze accounts for idle capital and generate allocation recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, accounts, riskProfile = 'moderate' } = await request.json();

    if (!userId || !accounts || !Array.isArray(accounts)) {
      return NextResponse.json(
        { error: 'Missing userId or accounts array' },
        { status: 400 }
      );
    }

    // Analyze portfolio for idle capital
    const portfolioAnalysis = analyzePortfolioIdleCapital(
      accounts.map((acc: any) => ({
        id: acc.id,
        type: acc.type,
        balance: acc.balance,
        lastActivityDate: new Date(acc.lastActivityDate),
        monthlyTransactions: acc.monthlyTransactions || 0,
      })),
      riskProfile
    );

    // Generate action plans for high-priority accounts
    const actionPlans = portfolioAnalysis.highPriorityAccounts.map((account) =>
      generateAllocationPlan(account)
    );

    return NextResponse.json({
      success: true,
      analysis: portfolioAnalysis,
      actionPlans,
      summary: {
        totalPortfolioValue: portfolioAnalysis.totalBalance,
        idleCapitalDetected: portfolioAnalysis.totalIdleAmount,
        idlePercentage: portfolioAnalysis.idlePercentage.toFixed(1),
        accountsWithIdleCapital: portfolioAnalysis.accountAnalysis.filter(
          (a) => a.idleAmount > 0
        ).length,
        estimatedMonthlyYield: (
          portfolioAnalysis.estimatedTotalAnnualYield / 12
        ).toFixed(2),
        estimatedAnnualYield: portfolioAnalysis.estimatedTotalAnnualYield.toFixed(2),
      },
      recommendations: portfolioAnalysis.aggregatedRecommendations,
      priority: {
        highPriorityCount: portfolioAnalysis.highPriorityAccounts.length,
        topOpportunity:
          portfolioAnalysis.highPriorityAccounts[0]?.idleAmount || 0,
        action:
          portfolioAnalysis.highPriorityAccounts.length > 0
            ? 'Immediate allocation recommended'
            : 'No high-priority idle capital detected',
      },
    });
  } catch (error) {
    console.error('[v0] Idle capital analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze idle capital',
      },
      { status: 500 }
    );
  }
}
