/**
 * Portfolio Rebalancer
 * Executes rebalancing operations with risk governance
 */

interface Asset {
  id: string;
  type: 'stock' | 'bond' | 'etf' | 'staking' | 'yield' | 'insurance';
  currentValue: number;
  allocation: number;
}

interface RebalanceExecution {
  id: string;
  timestamp: Date;
  oldAllocation: { traditional: number; longevity: number };
  newAllocation: { traditional: number; longevity: number };
  trades: TradeInstruction[];
  totalCost: number;
  estimatedTime: number; // minutes
  riskGovernanceChecks: RiskCheck[];
  approved: boolean;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

interface TradeInstruction {
  action: 'buy' | 'sell';
  assetType: string;
  targetAmount: number;
  estimatedPrice: number;
  estimatedCost: number;
}

interface RiskCheck {
  name: string;
  threshold: number;
  current: number;
  passed: boolean;
  message: string;
}

/**
 * Generate rebalancing trades
 */
export function generateRebalanceTrades(
  assets: Asset[],
  currentAllocation: { traditional: number; longevity: number },
  targetAllocation: { traditional: number; longevity: number } = { traditional: 70, longevity: 30 }
): TradeInstruction[] {
  const trades: TradeInstruction[] = [];
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  const traditionTypes = ['stock', 'bond', 'etf'];
  const longevityTypes = ['staking', 'yield', 'insurance'];

  // Calculate shifts needed
  const traditionTargetValue = (totalValue * targetAllocation.traditional) / 100;
  const longevityTargetValue = (totalValue * targetAllocation.longevity) / 100;

  const traditionCurrentValue = assets
    .filter((a) => traditionTypes.includes(a.type))
    .reduce((sum, a) => sum + a.currentValue, 0);

  const longevityCurrentValue = assets
    .filter((a) => longevityTypes.includes(a.type))
    .reduce((sum, a) => sum + a.currentValue, 0);

  const traditionDifference = traditionTargetValue - traditionCurrentValue;

  // If traditional is above target, sell and buy longevity
  if (traditionDifference < 0) {
    const sellAmount = Math.abs(traditionDifference);

    // Create sell instruction for traditional assets (prioritize lowest volatility)
    trades.push({
      action: 'sell',
      assetType: 'Traditional Assets',
      targetAmount: sellAmount,
      estimatedPrice: 1.0,
      estimatedCost: sellAmount,
    });

    // Create buy instruction for longevity assets
    trades.push({
      action: 'buy',
      assetType: 'Longevity Assets',
      targetAmount: sellAmount,
      estimatedPrice: 1.0,
      estimatedCost: sellAmount,
    });
  } else if (traditionDifference > 0) {
    const buyAmount = traditionDifference;

    // Sell longevity
    trades.push({
      action: 'sell',
      assetType: 'Longevity Assets',
      targetAmount: buyAmount,
      estimatedPrice: 1.0,
      estimatedCost: buyAmount,
    });

    // Buy traditional
    trades.push({
      action: 'buy',
      assetType: 'Traditional Assets',
      targetAmount: buyAmount,
      estimatedPrice: 1.0,
      estimatedCost: buyAmount,
    });
  }

  return trades;
}

/**
 * Perform risk governance checks before rebalancing
 */
export function performRiskGovernanceChecks(
  assets: Asset[],
  trades: TradeInstruction[],
  volatilityThreshold: number = 25,
  driftThreshold: number = 5
): RiskCheck[] {
  const checks: RiskCheck[] = [];

  // Check 1: Volatility constraint
  const portfolioVolatility = calculatePortfolioVolatility(assets);
  checks.push({
    name: 'Portfolio Volatility',
    threshold: volatilityThreshold,
    current: portfolioVolatility,
    passed: portfolioVolatility <= volatilityThreshold,
    message:
      portfolioVolatility <= volatilityThreshold
        ? `Portfolio volatility ${portfolioVolatility.toFixed(1)}% is within threshold`
        : `WARNING: Volatility ${portfolioVolatility.toFixed(1)}% exceeds threshold ${volatilityThreshold}%`,
  });

  // Check 2: Trade size constraint (no single trade > 20% of portfolio)
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const maxTradeSize = (totalValue * 20) / 100;
  const largestTrade = Math.max(...trades.map((t) => t.estimatedCost));

  checks.push({
    name: 'Trade Size Constraint',
    threshold: maxTradeSize,
    current: largestTrade,
    passed: largestTrade <= maxTradeSize,
    message:
      largestTrade <= maxTradeSize
        ? `Largest trade (${(largestTrade / totalValue * 100).toFixed(1)}%) is within 20% limit`
        : `WARNING: Single trade (${(largestTrade / totalValue * 100).toFixed(1)}%) exceeds 20% limit`,
  });

  // Check 3: Allocation constraint (70/30 after rebalance)
  const newAllocation = calculatePostRebalanceAllocation(assets, trades);
  const allocationDrift = Math.max(
    Math.abs(newAllocation.traditional - 70),
    Math.abs(newAllocation.longevity - 30)
  );

  checks.push({
    name: 'Allocation Target',
    threshold: 2.0,
    current: allocationDrift,
    passed: allocationDrift < 2.0,
    message:
      allocationDrift < 2.0
        ? `Rebalance will achieve 70/30 allocation within tolerance`
        : `WARNING: Post-rebalance allocation drift ${allocationDrift.toFixed(1)}%`,
  });

  // Check 4: Market hours constraint
  const now = new Date();
  const hour = now.getHours();
  const isMarketHours = hour >= 9 && hour < 16 && now.getDay() !== 0 && now.getDay() !== 6;

  checks.push({
    name: 'Market Hours',
    threshold: 1,
    current: isMarketHours ? 1 : 0,
    passed: isMarketHours,
    message: isMarketHours
      ? 'Executing during US market hours (9 AM - 4 PM EST)'
      : 'Queued for execution during next market hours',
  });

  // Check 5: Minimum balance check
  const minBalance = 100; // $100 minimum per asset
  const assetsWithSufficientFunds = assets.filter((a) => a.currentValue >= minBalance).length;

  checks.push({
    name: 'Minimum Balance',
    threshold: assets.length,
    current: assetsWithSufficientFunds,
    passed: assetsWithSufficientFunds === assets.length,
    message: assetsWithSufficientFunds === assets.length
      ? 'All assets have sufficient balance'
      : `WARNING: ${assets.length - assetsWithSufficientFunds} assets below minimum`,
  });

  return checks;
}

/**
 * Calculate portfolio volatility (weighted average)
 */
function calculatePortfolioVolatility(assets: Asset[]): number {
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  if (totalValue === 0) return 0;

  const volatilityMap: Record<string, number> = {
    stock: 18,
    bond: 8,
    etf: 15,
    staking: 45,
    yield: 35,
    insurance: 5,
  };

  let weightedVolatility = 0;
  assets.forEach((asset) => {
    const weight = asset.currentValue / totalValue;
    const volatility = volatilityMap[asset.type] || 20;
    weightedVolatility += weight * volatility;
  });

  return weightedVolatility;
}

/**
 * Calculate allocation after proposed trades
 */
function calculatePostRebalanceAllocation(
  assets: Asset[],
  trades: TradeInstruction[]
): { traditional: number; longevity: number } {
  let traditionValue = assets
    .filter((a) => ['stock', 'bond', 'etf'].includes(a.type))
    .reduce((sum, a) => sum + a.currentValue, 0);

  let longevityValue = assets
    .filter((a) => ['staking', 'yield', 'insurance'].includes(a.type))
    .reduce((sum, a) => sum + a.currentValue, 0);

  // Apply trades
  trades.forEach((trade) => {
    if (trade.action === 'sell' && trade.assetType === 'Traditional Assets') {
      traditionValue -= trade.estimatedCost;
      longevityValue += trade.estimatedCost;
    } else if (trade.action === 'sell' && trade.assetType === 'Longevity Assets') {
      longevityValue -= trade.estimatedCost;
      traditionValue += trade.estimatedCost;
    }
  });

  const totalValue = traditionValue + longevityValue;

  return {
    traditional: (traditionValue / totalValue) * 100,
    longevity: (longevityValue / totalValue) * 100,
  };
}

/**
 * Execute rebalancing (mock implementation)
 */
export async function executeRebalancing(
  userId: string,
  assets: Asset[],
  trades: TradeInstruction[],
  checks: RiskCheck[]
): Promise<RebalanceExecution> {
  // Check if all governance checks passed
  const allChecksPassed = checks.every((c) => c.passed);

  const totalCost = trades.reduce((sum, t) => sum + t.estimatedCost, 0);
  const estimatedTime = Math.ceil(trades.length * 2); // 2 minutes per trade

  const execution: RebalanceExecution = {
    id: `rebal_${Date.now()}`,
    timestamp: new Date(),
    oldAllocation: {
      traditional: assets
        .filter((a) => ['stock', 'bond', 'etf'].includes(a.type))
        .reduce((sum, a) => sum + a.currentValue, 0) /
        assets.reduce((sum, a) => sum + a.currentValue, 0) * 100,
      longevity: assets
        .filter((a) => ['staking', 'yield', 'insurance'].includes(a.type))
        .reduce((sum, a) => sum + a.currentValue, 0) /
        assets.reduce((sum, a) => sum + a.currentValue, 0) * 100,
    },
    newAllocation: calculatePostRebalanceAllocation(assets, trades),
    trades,
    totalCost,
    estimatedTime,
    riskGovernanceChecks: checks,
    approved: allChecksPassed,
    status: allChecksPassed ? 'executing' : 'pending',
  };

  return execution;
}

/**
 * Generate rebalancing summary report
 */
export function generateRebalancingSummary(
  execution: RebalanceExecution
): string {
  const lines = [
    '=== REBALANCING SUMMARY ===',
    `\nExecution ID: ${execution.id}`,
    `Timestamp: ${execution.timestamp.toISOString()}`,
    `Status: ${execution.status.toUpperCase()}`,
    `\nALLOCATION CHANGE:`,
    `  Traditional: ${execution.oldAllocation.traditional.toFixed(1)}% → ${execution.newAllocation.traditional.toFixed(1)}%`,
    `  Longevity: ${execution.oldAllocation.longevity.toFixed(1)}% → ${execution.newAllocation.longevity.toFixed(1)}%`,
    `\nTRADES (${execution.trades.length} total):`,
    ...execution.trades.map(
      (t) =>
        `  ${t.action.toUpperCase()} ${t.assetType}: $${t.estimatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    ),
    `\nTOTAL COST: $${execution.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    `ESTIMATED TIME: ${execution.estimatedTime} minutes`,
    `\nRISK GOVERNANCE CHECKS:`,
    ...execution.riskGovernanceChecks.map(
      (c) => `  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.message}`
    ),
    `\nAPPROVED: ${execution.approved ? 'YES' : 'NO'}`,
  ];

  return lines.join('\n');
}
