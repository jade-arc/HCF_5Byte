import { NextRequest, NextResponse } from "next/server";
import { scoreUserRisk } from "@/lib/services/risk-scorer";
import { getUserTransactions, saveRiskScore } from "@/lib/supabase";

// Prevent static generation for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/risk/calculate
 * Calculate dynamic risk score for a user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, totalCapital, riskPreference } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Fetch user's transaction history (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const transactions = await getUserTransactions(
      userId,
      oneYearAgo.toISOString()
    );

    // Convert to format expected by risk scorer
    const formattedTransactions = transactions.map((t: any) => ({
      amount: t.parsed_amount,
      date: new Date(t.parsed_date),
      category: t.category,
      type: t.transaction_type,
    }));

    // Calculate risk score
    const riskScore = await scoreUserRisk(
      formattedTransactions,
      totalCapital || 0,
      riskPreference || "moderate"
    );

    // Save to database
    const saved = await saveRiskScore(userId, {
      calculation_date: new Date().toISOString(),
      monthly_spending: riskScore.monthlySpending,
      spending_volatility: riskScore.spendingVolatility,
      idle_capital_ratio: riskScore.idleCapitalRatio,
      income_stability: riskScore.incomeStability,
      overall_risk_score: riskScore.overallRiskScore,
      risk_profile: riskScore.riskProfile,
      rebalance_recommended: riskScore.rebalanceRecommended,
      volatility_status: riskScore.volatilityStatus,
      explanation: riskScore.explanation,
    });

    return NextResponse.json({
      success: true,
      riskScore,
      saved,
    });
  } catch (error) {
    console.error("[v0] Risk calculation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to calculate risk",
      },
      { status: 500 }
    );
  }
}
