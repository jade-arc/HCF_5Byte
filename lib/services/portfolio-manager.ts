/**
 * Portfolio Manager
 * Handles 70/30 allocation strategy and dynamic rebalancing
 */

interface Asset {
  id: string;
  name: string;
  type: "stock" | "bond" | "etf" | "staking" | "yield" | "insurance";
  quantity: number;
  currentPrice: number;
  volatility: number; // 0-100
}

interface Portfolio {
  totalValue: number;
  assets: Asset[];
  traditionAllocation: number; // should be 70
  longevityAllocation: number; // should be 30
  lastRebalance: Date;
  volatilityThreshold: number; // default 25
  rebalanceThreshold: number; // default 5% drift
}

interface RebalanceRecommendation {
  shouldRebalance: boolean;
  driftPercentage: number;
  reason: string;
  proposedChanges: {
    assetId: string;
    currentAllocation: number;
    targetAllocation: number;
    action: "buy" | "sell";
    amount: number;
  }[];
}

/**
 * Calculate current portfolio allocation percentages
 */
export function calculateCurrentAllocation(
  assets: Asset[]
): {
  traditional: number;
  longevity: number;
} {
  const traditionTypes = ["stock", "bond", "etf"];
  const longevityTypes = ["staking", "yield", "insurance"];

  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  if (totalValue === 0) {
    return { traditional: 0, longevity: 0 };
  }

  const traditionValue = assets
    .filter((a) => traditionTypes.includes(a.type))
    .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  return {
    traditional: (traditionValue / totalValue) * 100,
    longevity: 100 - (traditionValue / totalValue) * 100,
  };
}

/**
 * Calculate allocation drift from 70/30 target
 */
export function calculateAllocationDrift(
  assets: Asset[]
): { traditionDrift: number; longevityDrift: number } {
  const current = calculateCurrentAllocation(assets);

  return {
    traditionDrift: Math.abs(current.traditional - 70),
    longevityDrift: Math.abs(current.longevity - 30),
  };
}

/**
 * Calculate portfolio volatility
 */
export function calculatePortfolioVolatility(assets: Asset[]): number {
  if (assets.length === 0) return 0;

  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  if (totalValue === 0) return 0;

  // Weighted volatility
  let weightedVolatility = 0;
  assets.forEach((asset) => {
    const weight = (asset.quantity * asset.currentPrice) / totalValue;
    weightedVolatility += asset.volatility * weight;
  });

  return weightedVolatility;
}

/**
 * Determine if rebalance is needed
 */
export function assessRebalanceNeed(
  assets: Asset[],
  rebalanceThreshold = 5, // percentage drift
  volatilityThreshold = 25,
  monthsSinceLastRebalance = 0
): RebalanceRecommendation {
  const drift = calculateAllocationDrift(assets);
  const maxDrift = Math.max(drift.traditionDrift, drift.longevityDrift);
  const volatility = calculatePortfolioVolatility(assets);

  // Rebalance triggers
  const driftTrigger = maxDrift > rebalanceThreshold;
  const volatilityTrigger = volatility > volatilityThreshold;
  const timeTrigger = monthsSinceLastRebalance > 6; // Quarterly rebalance

  if (!driftTrigger && !volatilityTrigger && !timeTrigger) {
    return {
      shouldRebalance: false,
      driftPercentage: maxDrift,
      reason: "Portfolio within target allocation",
      proposedChanges: [],
    };
  }

  // Generate rebalance proposal
  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const current = calculateCurrentAllocation(assets);

  const traditionTargetValue = (totalValue * 70) / 100;
  const longevityTargetValue = (totalValue * 30) / 100;

  const traditionCurrentValue = assets
    .filter((a) => ["stock", "bond", "etf"].includes(a.type))
    .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  const proposedChanges = [];
  let reason = "";

  if (driftTrigger) {
    reason += `Allocation drift of ${maxDrift.toFixed(1)}%. `;
  }
  if (volatilityTrigger) {
    reason += `Portfolio volatility (${volatility.toFixed(1)}%) exceeds threshold (${volatilityThreshold}%). `;
  }
  if (timeTrigger) {
    reason += "Scheduled quarterly rebalance. ";
  }

  // Simple proposal: if tradition too high, shift to longevity
  if (traditionCurrentValue > traditionTargetValue) {
    const sellAmount = traditionCurrentValue - traditionTargetValue;
    proposedChanges.push({
      assetId: "traditional_aggregate",
      currentAllocation: current.traditional,
      targetAllocation: 70,
      action: "sell",
      amount: sellAmount,
    });
    proposedChanges.push({
      assetId: "longevity_aggregate",
      currentAllocation: current.longevity,
      targetAllocation: 30,
      action: "buy",
      amount: sellAmount,
    });
  } else if (traditionCurrentValue < traditionTargetValue) {
    const buyAmount = traditionTargetValue - traditionCurrentValue;
    proposedChanges.push({
      assetId: "traditional_aggregate",
      currentAllocation: current.traditional,
      targetAllocation: 70,
      action: "buy",
      amount: buyAmount,
    });
    proposedChanges.push({
      assetId: "longevity_aggregate",
      currentAllocation: current.longevity,
      targetAllocation: 30,
      action: "sell",
      amount: buyAmount,
    });
  }

  return {
    shouldRebalance: true,
    driftPercentage: maxDrift,
    reason: reason.trim(),
    proposedChanges,
  };
}

/**
 * Get recommended asset allocation for a risk profile
 */
export function getAssetAllocationForProfile(
  riskProfile: "conservative" | "moderate" | "aggressive",
  availableBudget: number
): Asset[] {
  // Base allocation recommendations
  const allocations = {
    conservative: {
      bonds: 0.4,
      stocks: 0.2,
      etfs: 0.1,
      staking: 0.15,
      yield: 0.1,
      insurance: 0.05,
    },
    moderate: {
      bonds: 0.25,
      stocks: 0.3,
      etfs: 0.15,
      staking: 0.15,
      yield: 0.1,
      insurance: 0.05,
    },
    aggressive: {
      bonds: 0.1,
      stocks: 0.45,
      etfs: 0.15,
      staking: 0.15,
      yield: 0.1,
      insurance: 0.05,
    },
  };

  const profile = allocations[riskProfile];
  const assets: Asset[] = [];

  // Map to specific assets (simplified)
  const assetTemplates = [
    {
      key: "bonds",
      name: "US Treasury Bonds ETF",
      type: "bond" as const,
      volatility: 8,
    },
    {
      key: "stocks",
      name: "S&P 500 Index",
      type: "stock" as const,
      volatility: 18,
    },
    {
      key: "etfs",
      name: "Diversified ETF",
      type: "etf" as const,
      volatility: 15,
    },
    {
      key: "staking",
      name: "Ethereum Staking",
      type: "staking" as const,
      volatility: 45,
    },
    {
      key: "yield",
      name: "DeFi Yield Farming",
      type: "yield" as const,
      volatility: 35,
    },
    {
      key: "insurance",
      name: "Longevity Insurance",
      type: "insurance" as const,
      volatility: 5,
    },
  ];

  let cumulativeAllocation = 0;
  assetTemplates.forEach((template) => {
    const allocation = profile[template.key as keyof typeof profile] || 0;
    const amount = availableBudget * allocation;

    if (amount > 0) {
      assets.push({
        id: `${template.key}-${Date.now()}`,
        name: template.name,
        type: template.type,
        quantity: amount / 100, // Assume $100 per unit for simplicity
        currentPrice: 100,
        volatility: template.volatility,
      });

      cumulativeAllocation += allocation;
    }
  });

  return assets;
}

/**
 * Simulate portfolio growth with simulated APY
 */
export function simulatePortfolioGrowth(
  assets: Asset[],
  months: number,
  annualInflationRate = 0.03
): {
  startValue: number;
  endValue: number;
  gain: number;
  gainPercentage: number;
} {
  const startValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  // Simulate APY for longevity assets
  const longevityTypes = ["staking", "yield", "insurance"];
  const longevityAssets = assets.filter((a) => longevityTypes.includes(a.type));

  // Simulated APY rates
  const apyRates = {
    staking: 0.06,
    yield: 0.15,
    insurance: 0.04,
  };

  let endValue = 0;

  assets.forEach((asset) => {
    if (longevityTypes.includes(asset.type)) {
      const apy =
        apyRates[asset.type as keyof typeof apyRates] ||
        0.05;
      const monthlyRate = Math.pow(1 + apy, months / 12) - 1;
      const value = asset.quantity * asset.currentPrice * (1 + monthlyRate);
      endValue += value;
    } else {
      // Traditional assets: modest growth with inflation
      const traditionApy = 0.05; // 5% annual
      const monthlyRate = Math.pow(1 + traditionApy, months / 12) - 1;
      const value = asset.quantity * asset.currentPrice * (1 + monthlyRate);
      endValue += value;
    }
  });

  return {
    startValue,
    endValue,
    gain: endValue - startValue,
    gainPercentage: ((endValue - startValue) / startValue) * 100,
  };
}
