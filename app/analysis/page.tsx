'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card } from '@/components/ui/card';
import { RiskDetails } from '@/components/dashboard/risk-details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisData {
  monthly_spending: number;
  spending_volatility: number;
  idle_capital_ratio: number;
  income_stability: number;
  overall_risk_score: number;
  risk_profile: string;
  top_categories: Array<{ category: string; percentage: number; amount: number }>;
  recurring_transactions: Array<{ merchant: string; amount: number; frequency: string }>;
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analysis data
    const timer = setTimeout(() => {
      setData({
        monthly_spending: 4200,
        spending_volatility: 18.5,
        idle_capital_ratio: 32,
        income_stability: 78,
        overall_risk_score: 58,
        risk_profile: 'moderate',
        top_categories: [
          { category: 'Dining', percentage: 28, amount: 1176 },
          { category: 'Utilities', percentage: 18, amount: 756 },
          { category: 'Entertainment', percentage: 15, amount: 630 },
          { category: 'Shopping', percentage: 22, amount: 924 },
          { category: 'Transportation', percentage: 17, amount: 714 },
        ],
        recurring_transactions: [
          { merchant: 'Spotify', amount: 12.99, frequency: 'monthly' },
          { merchant: 'Netflix', amount: 15.99, frequency: 'monthly' },
          { merchant: 'Gym Membership', amount: 49.99, frequency: 'monthly' },
          { merchant: 'Insurance', amount: 125, frequency: 'monthly' },
        ],
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-foreground mt-4">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">Financial Analysis</h2>

        <Tabs defaultValue="risk" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="spending">Spending Patterns</TabsTrigger>
            <TabsTrigger value="recurring">Recurring Transactions</TabsTrigger>
          </TabsList>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            <RiskDetails
              monthlySpending={data.monthly_spending}
              spendingVolatility={data.spending_volatility}
              idleCapitalRatio={data.idle_capital_ratio}
              incomeStability={data.income_stability}
              overallRiskScore={data.overall_risk_score}
              riskProfile={data.risk_profile}
            />
          </TabsContent>

          {/* Spending Patterns Tab */}
          <TabsContent value="spending">
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground font-semibold mb-6">Spending Category Breakdown</h3>

              <div className="space-y-4">
                {data.top_categories.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-semibold text-sm">{cat.category}</span>
                      <span className="text-muted-foreground text-sm">
                        ${cat.amount.toLocaleString()} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-foreground font-semibold mb-4">Spending Insights</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Your spending is relatively stable with {data.spending_volatility.toFixed(1)}% volatility</li>
                  <li>• Dining and shopping combined account for 50% of your spending</li>
                  <li>• Consider reallocating entertainment budget toward investments</li>
                  <li>• Your income stability score of {data.income_stability}% suggests secure earnings</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* Recurring Transactions Tab */}
          <TabsContent value="recurring">
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground font-semibold mb-6">Subscription & Recurring Charges</h3>

              <div className="space-y-4">
                {data.recurring_transactions.map((trans, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <p className="text-foreground font-semibold text-sm">{trans.merchant}</p>
                      <p className="text-muted-foreground text-xs capitalize">{trans.frequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-semibold">${trans.amount.toFixed(2)}</p>
                      <p className="text-muted-foreground text-xs">
                        ${(trans.amount * 12).toFixed(2)}/year
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-muted-foreground text-sm mb-1">Monthly Subscriptions</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${data.recurring_transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-muted-foreground text-sm mb-1">Annual Cost</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(data.recurring_transactions.reduce((sum, t) => sum + t.amount, 0) * 12).toFixed(2)}
                    </p>
                  </div>
                </div>

                <h4 className="text-foreground font-semibold mt-6 mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Review subscriptions quarterly to eliminate unused services</li>
                  <li>• Consider annual billing options for {data.recurring_transactions.length}+ services (typically 10-20% discount)</li>
                  <li>• Annual recurring cost of ${(data.recurring_transactions.reduce((sum, t) => sum + t.amount, 0) * 12).toFixed(2)} could be optimized</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
