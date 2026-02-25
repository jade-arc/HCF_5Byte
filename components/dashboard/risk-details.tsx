'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RiskDetailProps {
  monthlySpending: number;
  spendingVolatility: number;
  idleCapitalRatio: number;
  incomeStability: number;
  overallRiskScore: number;
  riskProfile: string;
}

export function RiskDetails(props: RiskDetailProps) {
  const scoreBreakdown = [
    {
      name: 'Spending Volatility',
      score: Math.min(props.spendingVolatility, 100),
      weight: '35%',
      description: 'Higher volatility = higher risk',
    },
    {
      name: 'Idle Capital',
      score: Math.max(0, props.idleCapitalRatio - 30),
      weight: '25%',
      description: 'Unused capital indicates inefficiency',
    },
    {
      name: 'Income Stability',
      score: 100 - props.incomeStability,
      weight: '25%',
      description: 'Unstable income increases risk',
    },
    {
      name: 'Risk Preference',
      score: props.riskProfile === 'conservative' ? 20 : props.riskProfile === 'moderate' ? 50 : 80,
      weight: '15%',
      description: 'User-defined risk tolerance',
    },
  ];

  const riskTimeline = [
    { month: 'Jan', score: 52 },
    { month: 'Feb', score: 55 },
    { month: 'Mar', score: 54 },
    { month: 'Apr', score: 58 },
    { month: 'May', score: 56 },
    { month: 'Jun', score: props.overallRiskScore },
  ];

  return (
    <>
      {/* Risk Score Breakdown */}
      <Card className="bg-card border-border p-6 mb-8">
        <h3 className="text-foreground font-semibold mb-6">Risk Score Breakdown</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Components */}
          <div className="space-y-4">
            {scoreBreakdown.map((component, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-foreground font-semibold text-sm">{component.name}</p>
                    <p className="text-muted-foreground text-xs">{component.description}</p>
                  </div>
                  <span className="text-muted-foreground text-xs font-semibold bg-muted px-2 py-1 rounded">
                    {component.weight}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-orange-400 h-2 rounded-full"
                    style={{ width: `${Math.min(component.score, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{component.score.toFixed(1)}/100</p>
              </div>
            ))}
          </div>

          {/* Overall Score Visualization */}
          <div className="bg-muted/30 rounded-lg p-6 flex flex-col justify-center">
            <p className="text-muted-foreground text-sm mb-3">Overall Risk Score</p>
            <div className="mb-6">
              <div className="relative h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-muted opacity-30" />
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: '#10b981',
                    borderRightColor: '#f59e0b',
                    borderBottomColor: '#ef4444',
                    borderLeftColor: '#06b6d4',
                    transform: `rotate(${(props.overallRiskScore / 100) * 360 - 90}deg)`,
                  }}
                />
                <div className="text-center z-10">
                  <div className="text-5xl font-bold text-primary">{props.overallRiskScore}</div>
                  <p className="text-muted-foreground text-sm">/ 100</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-foreground font-semibold capitalize">{props.riskProfile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trend:</span>
                <span className="text-green-400 font-semibold">Stable</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Score Timeline */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-foreground font-semibold mb-6">Risk Score Trend (6 Months)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a202c',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value) => [`${value}/100`, 'Risk Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Your risk score is recalculated monthly based on updated transaction data, spending patterns, and market conditions. Lower scores indicate more conservative positioning, higher scores indicate more aggressive growth.
          </p>
        </div>
      </Card>
    </>
  );
}
