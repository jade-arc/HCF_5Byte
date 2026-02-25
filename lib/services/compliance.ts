/**
 * Compliance & Risk Governance
 * Enforces regulatory and risk management rules
 */

interface CompliancePolicy {
  maxAllocationDrift: number; // %
  maxPortfolioVolatility: number; // %
  minRebalanceInterval: number; // days
  maxSingleTradeSize: number; // % of portfolio
  requiredApprovals: number;
  volatilityBreachNotification: boolean;
  suitabilityCheck: boolean;
}

interface ComplianceReport {
  timestamp: Date;
  userId: string;
  policies: { name: string; compliant: boolean; message: string }[];
  overallCompliant: boolean;
  violations: ComplianceViolation[];
  recommendations: string[];
}

interface ComplianceViolation {
  severity: 'info' | 'warning' | 'critical';
  policy: string;
  description: string;
  remediation: string;
  timestamp: Date;
}

/**
 * Default compliance policies
 */
export const DEFAULT_COMPLIANCE_POLICY: CompliancePolicy = {
  maxAllocationDrift: 5.0,
  maxPortfolioVolatility: 25.0,
  minRebalanceInterval: 7,
  maxSingleTradeSize: 20.0,
  requiredApprovals: 1,
  volatilityBreachNotification: true,
  suitabilityCheck: true,
};

/**
 * Check portfolio against compliance policies
 */
export function checkCompliance(
  userId: string,
  portfolioData: {
    totalValue: number;
    allocation: { traditional: number; longevity: number };
    volatility: number;
    lastRebalanceDate: Date;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
  },
  policy: CompliancePolicy = DEFAULT_COMPLIANCE_POLICY
): ComplianceReport {
  const violations: ComplianceViolation[] = [];
  const checks: { name: string; compliant: boolean; message: string }[] = [];

  // Check 1: Allocation drift
  const traditionDrift = Math.abs(portfolioData.allocation.traditional - 70);
  const longevityDrift = Math.abs(portfolioData.allocation.longevity - 30);
  const maxDrift = Math.max(traditionDrift, longevityDrift);

  const allocationCompliant = maxDrift <= policy.maxAllocationDrift;
  checks.push({
    name: 'Allocation Drift',
    compliant: allocationCompliant,
    message: allocationCompliant
      ? `Allocation drift ${maxDrift.toFixed(1)}% is within policy (${policy.maxAllocationDrift}%)`
      : `Allocation drift ${maxDrift.toFixed(1)}% exceeds policy threshold`,
  });

  if (!allocationCompliant) {
    violations.push({
      severity: 'warning',
      policy: 'Allocation Drift',
      description: `Current allocation drift is ${maxDrift.toFixed(1)}%, exceeding policy of ${policy.maxAllocationDrift}%`,
      remediation: 'Perform portfolio rebalancing to restore 70/30 allocation',
      timestamp: new Date(),
    });
  }

  // Check 2: Portfolio volatility
  const volatilityCompliant = portfolioData.volatility <= policy.maxPortfolioVolatility;
  checks.push({
    name: 'Portfolio Volatility',
    compliant: volatilityCompliant,
    message: volatilityCompliant
      ? `Portfolio volatility ${portfolioData.volatility.toFixed(1)}% is within policy (${policy.maxPortfolioVolatility}%)`
      : `Portfolio volatility ${portfolioData.volatility.toFixed(1)}% exceeds policy threshold`,
  });

  if (!volatilityCompliant) {
    violations.push({
      severity: 'critical',
      policy: 'Portfolio Volatility',
      description: `Portfolio volatility ${portfolioData.volatility.toFixed(1)}% exceeds policy threshold of ${policy.maxPortfolioVolatility}%`,
      remediation:
        'Rebalance toward lower-volatility assets or adjust risk profile',
      timestamp: new Date(),
    });
  }

  // Check 3: Rebalance frequency
  const daysSinceRebalance = Math.floor(
    (Date.now() - portfolioData.lastRebalanceDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const rebalanceFrequencyCompliant =
    daysSinceRebalance <= 180; // Max 6 months
  checks.push({
    name: 'Rebalance Frequency',
    compliant: rebalanceFrequencyCompliant,
    message: rebalanceFrequencyCompliant
      ? `Portfolio rebalanced ${daysSinceRebalance} days ago`
      : `Portfolio has not been rebalanced for ${daysSinceRebalance} days`,
  });

  if (!rebalanceFrequencyCompliant) {
    violations.push({
      severity: 'warning',
      policy: 'Rebalance Frequency',
      description: `Portfolio last rebalanced ${daysSinceRebalance} days ago (exceeds 6-month guideline)`,
      remediation: 'Schedule immediate portfolio rebalancing',
      timestamp: new Date(),
    });
  }

  // Check 4: Risk profile suitability
  let suitabilityCompliant = true;
  let suitabilityMessage = '';

  if (policy.suitabilityCheck) {
    const isAggressive = portfolioData.riskProfile === 'aggressive';
    const volatilityTooHigh = portfolioData.volatility > 30;

    if (isAggressive && !volatilityTooHigh) {
      suitabilityCompliant = true;
      suitabilityMessage =
        'Aggressive portfolio suitable for risk profile';
    } else if (!isAggressive && volatilityTooHigh) {
      suitabilityCompliant = false;
      suitabilityMessage =
        'Portfolio volatility exceeds risk profile tolerance';
    } else {
      suitabilityCompliant = true;
      suitabilityMessage =
        'Portfolio is suitable for stated risk profile';
    }
  }

  checks.push({
    name: 'Suitability',
    compliant: suitabilityCompliant,
    message: suitabilityMessage,
  });

  if (!suitabilityCompliant) {
    violations.push({
      severity: 'warning',
      policy: 'Suitability',
      description: suitabilityMessage,
      remediation: 'Adjust portfolio composition or update risk profile',
      timestamp: new Date(),
    });
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (!allocationCompliant) {
    recommendations.push(
      'Rebalance portfolio to restore 70/30 allocation'
    );
  }

  if (!volatilityCompliant) {
    recommendations.push(
      'Reduce portfolio volatility by allocating more to conservative assets'
    );
  }

  if (maxDrift > policy.maxAllocationDrift * 0.5) {
    recommendations.push(
      'Monitor allocation drift closely; consider rebalancing soon'
    );
  }

  if (daysSinceRebalance > 90) {
    recommendations.push('Schedule quarterly portfolio rebalance');
  }

  const overallCompliant =
    allocationCompliant &&
    volatilityCompliant &&
    rebalanceFrequencyCompliant &&
    suitabilityCompliant;

  return {
    timestamp: new Date(),
    userId,
    policies: checks,
    overallCompliant,
    violations,
    recommendations,
  };
}

/**
 * Track audit events for compliance
 */
export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  riskGovernanceCheckPassed: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log compliance-critical actions
 */
export function createAuditEvent(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  riskGovernanceCheckPassed: boolean,
  ipAddress?: string
): AuditEvent {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    riskGovernanceCheckPassed,
    timestamp: new Date(),
    ipAddress,
  };
}

/**
 * Generate compliance report for regulatory filing
 */
export function generateComplianceReportForFiling(
  userId: string,
  complianceData: ComplianceReport[]
): string {
  const lines = [
    '=== COMPLIANCE REPORT FOR REGULATORY FILING ===',
    `User ID: ${userId}`,
    `Report Date: ${new Date().toISOString()}`,
    `Period: Last 30 days`,
    `\nSUMMARY:`,
    `Total Compliance Checks: ${complianceData.length}`,
    `Compliant Checks: ${complianceData.filter((c) => c.overallCompliant).length}`,
    `Total Violations: ${complianceData.reduce((sum, c) => sum + c.violations.length, 0)}`,
    `\nVIOLATION DETAILS:`,
  ];

  complianceData.forEach((report) => {
    report.violations.forEach((v) => {
      lines.push(
        `\n[${v.severity.toUpperCase()}] ${v.policy} - ${v.timestamp.toISOString()}`
      );
      lines.push(`  Description: ${v.description}`);
      lines.push(`  Remediation: ${v.remediation}`);
    });
  });

  lines.push(`\nPOLICY COMPLIANCE:`, '');

  // Aggregate policy compliance across all reports
  const policyCompliance: Record<string, number> = {};
  complianceData.forEach((report) => {
    report.policies.forEach((p) => {
      if (!policyCompliance[p.name]) {
        policyCompliance[p.name] = { compliant: 0, total: 0 };
      }
      policyCompliance[p.name].total += 1;
      if (p.compliant) policyCompliance[p.name].compliant += 1;
    });
  });

  Object.entries(policyCompliance).forEach(([policy, { compliant, total }]) => {
    const percentage = ((compliant / total) * 100).toFixed(1);
    lines.push(`  ${policy}: ${compliant}/${total} (${percentage}%)`);
  });

  lines.push(
    `\nCertification: This report certifies compliance status as of ${new Date().toISOString()}`
  );

  return lines.join('\n');
}

/**
 * Check if user meets investment eligibility criteria
 */
export function verifyInvestmentEligibility(userProfile: {
  age: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  minimumBalance: number;
  accreditedInvestor: boolean;
}): {
  eligible: boolean;
  restrictions: string[];
  recommendations: string[];
} {
  const restrictions: string[] = [];
  const recommendations: string[] = [];

  // Age check (18+)
  if (userProfile.age < 18) {
    restrictions.push('User must be 18 years or older');
  }

  // Minimum balance check
  if (userProfile.minimumBalance < 1000) {
    restrictions.push(
      'Minimum balance of $1,000 required to activate portfolio'
    );
  } else if (userProfile.minimumBalance < 10000) {
    recommendations.push('Consider increasing balance to unlock all asset types');
  }

  // Aggressive profile without accreditation
  if (
    userProfile.riskProfile === 'aggressive' &&
    !userProfile.accreditedInvestor
  ) {
    recommendations.push(
      'Aggressive profile benefits from accredited investor status for alternative assets'
    );
  }

  const eligible = restrictions.length === 0;

  return {
    eligible,
    restrictions,
    recommendations,
  };
}
