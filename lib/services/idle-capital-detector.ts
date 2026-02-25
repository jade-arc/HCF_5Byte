/**
 * Idle Capital Detector
 * Identifies dormant funds and recommends allocation strategies
 */

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  lastActivityDate: Date;
  monthlyTransactions: number;
}

interface IdleCapitalAnalysis {
  accountId: string;
  accountType: string;
  balance: number;
  inactivityDays: number;
  idleRatio: number; // 0-100, percentage of balance considered idle
  idleAmount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: AllocationRecommendation[];
  estimatedAnnualYield: number;
}

interface AllocationRecommendation {
  assetType: string;
  percentageAllocation: number;
  expectedAPY: number;
  rationale: string;
}

/**
 * Analyze an account for idle capital
 */
export function analyzeAccountIdleCapital(
  account: Account,
  riskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): IdleCapitalAnalysis {
  const now = new Date();
  const inactivityDays = Math.floor(
    (now.getTime() - account.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate idle ratio
  let idleRatio = 0;

  if (inactivityDays < 7) {
    idleRatio = 0; // Recent activity
  } else if (inactivityDays < 30) {
    idleRatio = Math.min(50, inactivityDays * 3); // Up to 50% idle
  } else if (inactivityDays < 90) {
    idleRatio = Math.min(75, 50 + (inactivityDays - 30) * 0.8);
  } else {
    idleRatio = 100; // Completely idle
  }

  // Factor in account type
  if (account.type === 'savings') {
    idleRatio *= 0.7; // Savings accounts are expected to be quieter
  } else if (account.type === 'investment') {
    idleRatio *= 1.2; // Investment accounts should be more active
  }

  idleRatio = Math.min(100, idleRatio);

  const idleAmount = (account.balance * idleRatio) / 100;

  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (idleAmount < 1000) {
    severity = 'low';
  } else if (idleAmount < 5000) {
    severity = 'medium';
  } else if (idleAmount < 20000) {
    severity = 'high';
  } else {
    severity = 'critical';
  }

  // Generate recommendations based on risk profile
  const recommendations = generateAllocationRecommendations(
    riskProfile,
    idleAmount
  );

  // Calculate estimated annual yield
  const estimatedAnnualYield = recommendations.reduce(
    (sum, rec) =>
      sum +
      idleAmount *
        (rec.percentageAllocation / 100) *
        (rec.expectedAPY / 100),
    0
  );

  return {
    accountId: account.id,
    accountType: account.type,
    balance: account.balance,
    inactivityDays,
    idleRatio,
    idleAmount,
    severity,
    recommendations,
    estimatedAnnualYield,
  };
}

/**
 * Generate allocation recommendations based on risk profile
 */
function generateAllocationRecommendations(
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  idleAmount: number
): AllocationRecommendation[] {
  const recommendations: AllocationRecommendation[] = [];

  switch (riskProfile) {
    case 'conservative':
      recommendations.push({
        assetType: 'High-Yield Savings',
        percentageAllocation: 60,
        expectedAPY: 4.5,
        rationale:
          'Safe, liquid option with competitive returns matching inflation',
      });
      recommendations.push({
        assetType: 'Treasury Bonds',
        percentageAllocation: 30,
        expectedAPY: 4.8,
        rationale: 'Government-backed securities with predictable returns',
      });
      recommendations.push({
        assetType: 'Short-Term Bond Fund',
        percentageAllocation: 10,
        expectedAPY: 4.2,
        rationale: 'Diversified bond exposure with lower volatility',
      });
      break;

    case 'moderate':
      recommendations.push({
        assetType: 'Staking Pools',
        percentageAllocation: 40,
        expectedAPY: 6.0,
        rationale:
          'Balanced yield generation through cryptographic staking protocols',
      });
      recommendations.push({
        assetType: 'Dividend ETFs',
        percentageAllocation: 35,
        expectedAPY: 3.5,
        rationale:
          'Market-linked returns with regular income distribution',
      });
      recommendations.push({
        assetType: 'Fixed Income',
        percentageAllocation: 15,
        expectedAPY: 4.5,
        rationale: 'Capital preservation with stable income',
      });
      recommendations.push({
        assetType: 'Longevity Insurance',
        percentageAllocation: 10,
        expectedAPY: 3.8,
        rationale:
          'Life expectancy-linked returns for retirement optimization',
      });
      break;

    case 'aggressive':
      recommendations.push({
        assetType: 'Yield Farming',
        percentageAllocation: 35,
        expectedAPY: 12.0,
        rationale:
          'Higher yield generation through decentralized finance strategies',
      });
      recommendations.push({
        assetType: 'Growth ETFs',
        percentageAllocation: 40,
        expectedAPY: 8.5,
        rationale:
          'Equity exposure for capital appreciation and dividend growth',
      });
      recommendations.push({
        assetType: 'Staking',
        percentageAllocation: 15,
        expectedAPY: 7.0,
        rationale: 'Cryptocurrency staking for enhanced returns',
      });
      recommendations.push({
        assetType: 'Small Cap Index',
        percentageAllocation: 10,
        expectedAPY: 9.0,
        rationale: 'High-growth potential for long-term wealth building',
      });
      break;
  }

  return recommendations;
}

/**
 * Analyze multiple accounts and aggregate idle capital
 */
export function analyzePortfolioIdleCapital(
  accounts: Account[],
  riskProfile: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): {
  totalBalance: number;
  totalIdleAmount: number;
  idlePercentage: number;
  accountAnalysis: IdleCapitalAnalysis[];
  aggregatedRecommendations: Record<string, number>;
  estimatedTotalAnnualYield: number;
  highPriorityAccounts: IdleCapitalAnalysis[];
} {
  const accountAnalysis = accounts.map((acc) =>
    analyzeAccountIdleCapital(acc, riskProfile)
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIdleAmount = accountAnalysis.reduce(
    (sum, analysis) => sum + analysis.idleAmount,
    0
  );
  const idlePercentage = (totalIdleAmount / totalBalance) * 100;

  // Aggregate recommendations
  const aggregatedRecommendations: Record<string, number> = {};
  accountAnalysis.forEach((analysis) => {
    analysis.recommendations.forEach((rec) => {
      aggregatedRecommendations[rec.assetType] =
        (aggregatedRecommendations[rec.assetType] || 0) +
        rec.percentageAllocation;
    });
  });

  // Average the recommendations
  Object.keys(aggregatedRecommendations).forEach((key) => {
    aggregatedRecommendations[key] /= accountAnalysis.length;
  });

  const estimatedTotalAnnualYield = accountAnalysis.reduce(
    (sum, analysis) => sum + analysis.estimatedAnnualYield,
    0
  );

  // Identify high priority accounts
  const highPriorityAccounts = accountAnalysis
    .filter((a) => a.severity === 'high' || a.severity === 'critical')
    .sort((a, b) => b.idleAmount - a.idleAmount);

  return {
    totalBalance,
    totalIdleAmount,
    idlePercentage,
    accountAnalysis,
    aggregatedRecommendations,
    estimatedTotalAnnualYield,
    highPriorityAccounts,
  };
}

/**
 * Generate action plan for idle capital allocation
 */
export function generateAllocationPlan(
  analysis: IdleCapitalAnalysis
): {
  actionItems: string[];
  expectedMonthlyYield: number;
  implementation: { assetType: string; amount: number }[];
} {
  const actionItems: string[] = [];
  const implementation = [];

  if (analysis.idleAmount === 0) {
    actionItems.push('Your account is actively invested. No action needed.');
    return {
      actionItems,
      expectedMonthlyYield: 0,
      implementation,
    };
  }

  if (analysis.inactivityDays > 30) {
    actionItems.push(
      `⚠️ Account inactive for ${analysis.inactivityDays} days`
    );
  }

  if (analysis.idleAmount > 10000) {
    actionItems.push(
      `💡 Opportunity: Allocate $${analysis.idleAmount.toLocaleString()} to generate ~$${Math.round(analysis.estimatedAnnualYield / 12)}/month`
    );
  }

  analysis.recommendations.forEach((rec) => {
    const amount = analysis.idleAmount * (rec.percentageAllocation / 100);
    actionItems.push(
      `📊 Allocate $${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} to ${rec.assetType} (${rec.expectedAPY}% APY)`
    );
    implementation.push({
      assetType: rec.assetType,
      amount,
    });
  });

  actionItems.push(
    `✅ Complete allocation in 1-2 business days to start earning yield`
  );

  const expectedMonthlyYield = analysis.estimatedAnnualYield / 12;

  return {
    actionItems,
    expectedMonthlyYield,
    implementation,
  };
}

/**
 * Calculate time to deploy idle capital
 */
export function calculateDeploymentTimeline(
  idleAmount: number,
  assetType: string
): {
  daysToActivation: number;
  rationale: string;
} {
  const timelines: Record<string, { days: number; rationale: string }> = {
    'High-Yield Savings': {
      days: 1,
      rationale: 'Immediate activation with same-day settlement',
    },
    'Treasury Bonds': {
      days: 3,
      rationale: 'Settlement through US Treasury direct system',
    },
    'Dividend ETFs': {
      days: 1,
      rationale: 'Immediate activation through securities exchange',
    },
    'Staking Pools': {
      days: 2,
      rationale: 'Smart contract deployment and confirmation',
    },
    'Yield Farming': {
      days: 1,
      rationale: 'Direct protocol interaction with blockchain confirmation',
    },
    'Longevity Insurance': {
      days: 5,
      rationale: 'Underwriting process and policy issuance',
    },
    'Short-Term Bond Fund': {
      days: 2,
      rationale: 'Fund purchase and settlement',
    },
    'Growth ETFs': {
      days: 1,
      rationale: 'Immediate activation through securities exchange',
    },
    'Small Cap Index': {
      days: 1,
      rationale: 'Immediate activation through index fund',
    },
    'Fixed Income': {
      days: 3,
      rationale: 'Bond settlement and portfolio allocation',
    },
  };

  const timeline = timelines[assetType] || {
    days: 3,
    rationale: 'Standard settlement period',
  };

  return timeline;
}
