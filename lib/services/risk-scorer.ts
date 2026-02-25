import { GoogleGenerativeAI } from "@google/generative-ai";

interface Transaction {
  amount: number;
  date: Date;
  category: string;
  type: "debit" | "credit" | "transfer" | "fee";
}

interface RiskScoreResult {
  overallRiskScore: number; // 0-100
  riskProfile: "conservative" | "moderate" | "aggressive";
  monthlySpending: number;
  spendingVolatility: number; // coefficient of variation
  idleCapitalRatio: number; // percentage
  incomeStability: number; // 0-100
  volatilityStatus: "normal" | "elevated" | "warning" | "breach";
  rebalanceRecommended: boolean;
  explanation: string;
}

const client = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

/**
 * Calculate spending volatility from transaction history
 * Uses standard deviation and coefficient of variation
 */
function calculateSpendingVolatility(transactions: Transaction[]): number {
  // Group by month
  const monthlySpending = new Map<string, number>();

  transactions
    .filter((t) => t.type === "debit" && t.category !== "transfer")
    .forEach((t) => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      monthlySpending.set(key, (monthlySpending.get(key) || 0) + t.amount);
    });

  if (monthlySpending.size < 2) return 0;

  const values = Array.from(monthlySpending.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation (CV = stdDev / mean)
  return mean > 0 ? (stdDev / mean) * 100 : 0;
}

/**
 * Calculate total monthly spending
 */
function calculateMonthlySpending(transactions: Transaction[]): number {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return transactions
    .filter(
      (t) =>
        t.type === "debit" &&
        t.category !== "transfer" &&
        t.date >= oneMonthAgo
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Detect idle capital (cash that hasn't moved in 30+ days)
 */
function calculateIdleCapitalRatio(
  totalCapital: number,
  transactions: Transaction[]
): number {
  if (totalCapital === 0) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find the minimum balance over the last 30 days
  // (conservative estimate: assume balance at last transaction)
  const recentTransactions = transactions.filter((t) => t.date >= thirtyDaysAgo);

  if (recentTransactions.length === 0) {
    // No transactions in 30 days = all is idle
    return 100;
  }

  const lastTransaction = recentTransactions[recentTransactions.length - 1];
  const inactivityDays = Math.floor(
    (Date.now() - lastTransaction.date.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Simple heuristic: if >30 days inactive, estimate 60% as idle
  if (inactivityDays > 30) {
    return 60;
  }

  return Math.max(0, inactivityDays * 2); // 2% per day of inactivity
}

/**
 * Assess income stability from credit transactions
 */
function calculateIncomeStability(transactions: Transaction[]): number {
  const creditTransactions = transactions.filter((t) => t.type === "credit");

  if (creditTransactions.length < 2) return 50;

  // Group credits by month
  const monthlyCredits = new Map<string, number>();
  creditTransactions.forEach((t) => {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyCredits.set(key, (monthlyCredits.get(key) || 0) + t.amount);
  });

  if (monthlyCredits.size < 2) return 50;

  const values = Array.from(monthlyCredits.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;

  // Convert CV to stability score (lower CV = higher stability)
  // CV of 0 = 100 stability, CV of 1+ = 0 stability
  return Math.max(0, 100 - cv * 100);
}

/**
 * Use Gemini to generate narrative risk explanation
 */
async function generateRiskExplanation(
  overallScore: number,
  profile: string,
  volatility: number,
  spendingTrend: "increasing" | "decreasing" | "stable"
): Promise<string> {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate a brief (1-2 sentence) financial risk explanation for:
- Overall Risk Score: ${overallScore}/100
- Risk Profile: ${profile}
- Spending Volatility: ${volatility.toFixed(1)}%
- Spending Trend: ${spendingTrend}

Be concise and actionable.`;

  try {
    const response = await model.generateContent(prompt);
    const text =
      response.content.parts[0].type === "text"
        ? response.content.parts[0].text
        : "";
    return text.trim();
  } catch (error) {
    return `Risk profile is ${profile}. Volatility at ${volatility.toFixed(1)}%.`;
  }
}

/**
 * Determine volatility status based on thresholds
 */
function determineVolatilityStatus(
  volatility: number,
  volatilityThreshold = 25
): "normal" | "elevated" | "warning" | "breach" {
  if (volatility > volatilityThreshold * 2) return "breach";
  if (volatility > volatilityThreshold * 1.5) return "warning";
  if (volatility > volatilityThreshold) return "elevated";
  return "normal";
}

/**
 * Main risk scoring function
 */
export async function scoreUserRisk(
  transactions: Transaction[],
  totalCapital: number,
  userRiskPreference: "conservative" | "moderate" | "aggressive" = "moderate"
): Promise<RiskScoreResult> {
  const monthlySpending = calculateMonthlySpending(transactions);
  const spendingVolatility = calculateSpendingVolatility(transactions);
  const idleCapitalRatio = calculateIdleCapitalRatio(totalCapital, transactions);
  const incomeStability = calculateIncomeStability(transactions);

  // Weighted risk score calculation
  // Lower spending volatility and higher income stability = lower risk
  // Higher idle capital = indicates stability but potential inefficiency
  const volatilityComponent = Math.min(spendingVolatility, 100) * 0.35;
  const idleComponent = Math.max(0, idleCapitalRatio - 30) * 0.25; // Penalize excessive idle capital
  const incomeComponent = (100 - incomeStability) * 0.25;
  const preferenceComponent = {
    conservative: 20,
    moderate: 50,
    aggressive: 80,
  }[userRiskPreference] * 0.15;

  const overallRiskScore = Math.round(
    volatilityComponent + idleComponent + incomeComponent + preferenceComponent
  );

  // Determine risk profile
  let riskProfile: "conservative" | "moderate" | "aggressive";
  if (overallRiskScore < 40) {
    riskProfile = "conservative";
  } else if (overallRiskScore < 65) {
    riskProfile = "moderate";
  } else {
    riskProfile = "aggressive";
  }

  // Determine if rebalance is recommended
  const volatilityThreshold = 25;
  const volatilityStatus = determineVolatilityStatus(
    spendingVolatility,
    volatilityThreshold
  );
  const rebalanceRecommended =
    volatilityStatus !== "normal" ||
    idleCapitalRatio > 40 ||
    spendingVolatility > 30;

  // Determine spending trend (simplified)
  const spendingTrend =
    spendingVolatility > 35 ? "increasing" : "stable";

  // Generate explanation
  const explanation = await generateRiskExplanation(
    overallRiskScore,
    riskProfile,
    spendingVolatility,
    spendingTrend as "increasing" | "decreasing" | "stable"
  );

  return {
    overallRiskScore,
    riskProfile,
    monthlySpending,
    spendingVolatility,
    idleCapitalRatio,
    incomeStability,
    volatilityStatus,
    rebalanceRecommended,
    explanation,
  };
}
