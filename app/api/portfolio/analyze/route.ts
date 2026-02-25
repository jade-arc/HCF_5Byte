import { NextRequest, NextResponse } from "next/server";
import {
  assessRebalanceNeed,
  getAssetAllocationForProfile,
  simulatePortfolioGrowth,
} from "@/lib/services/portfolio-manager";
import { getUserPortfolio, saveRebalanceHistory } from "@/lib/supabase";

// Prevent static generation for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/portfolio/analyze
 * Analyze portfolio and determine rebalancing needs
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      availableCapital,
      riskProfile,
      volatilityThreshold,
      rebalanceThreshold,
    } = await request.json();

    if (!userId || !availableCapital) {
      return NextResponse.json(
        { error: "Missing userId or availableCapital" },
        { status: 400 }
      );
    }

    // Get recommended asset allocation for risk profile
    const assets = getAssetAllocationForProfile(
      riskProfile || "moderate",
      availableCapital
    );

    // Assess rebalancing needs
    const rebalanceRecommendation = assessRebalanceNeed(
      assets,
      rebalanceThreshold || 5,
      volatilityThreshold || 25,
      0 // months since last rebalance (0 for new portfolio)
    );

    // Simulate 12-month growth
    const projection = simulatePortfolioGrowth(assets, 12);

    // Save rebalance history if recommended
    if (rebalanceRecommendation.shouldRebalance) {
      await saveRebalanceHistory(userId, {
        rebalance_date: new Date().toISOString(),
        trigger_reason: "user_request",
        old_allocation: { assets: [] },
        new_allocation: { assets },
        volatility_threshold_breached: false,
        changes: rebalanceRecommendation,
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      assets,
      rebalanceRecommendation,
      projection,
      summary: {
        totalAllocation: availableCapital,
        riskProfile,
        traditionalAllocation: "70%",
        longevityAllocation: "30%",
        projectedGain: projection.gain,
        projectedGainPercentage: projection.gainPercentage,
      },
    });
  } catch (error) {
    console.error("[v0] Portfolio analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze portfolio",
      },
      { status: 500 }
    );
  }
}
