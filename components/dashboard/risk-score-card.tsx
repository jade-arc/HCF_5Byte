'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface RiskScoreCardProps {
  riskScore: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  trend: 'up' | 'down' | 'stable';
}

export function RiskScoreCard({ riskScore, riskProfile, trend }: RiskScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-green-400';
    if (score < 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'bg-green-400/20 text-green-400';
      case 'moderate':
        return 'bg-blue-400/20 text-blue-400';
      case 'aggressive':
        return 'bg-orange-400/20 text-orange-400';
      default:
        return 'bg-gray-400/20 text-gray-400';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border p-6 hover:border-primary/50 transition-colors cursor-default">
      <h3 className="text-foreground font-semibold mb-4">Risk Score</h3>
      <div className="mb-6">
        <div className={`text-5xl font-bold mb-2 transition-all duration-300 ${getScoreColor(riskScore)}`}>
          {riskScore}
        </div>
        <p className="text-muted-foreground text-sm">Out of 100</p>
      </div>

      <div className="space-y-3">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(riskProfile)}`}>
            {riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} Risk
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-red-400" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-green-400" />
          ) : (
            <div className="h-4 w-4 rounded-full bg-blue-400" />
          )}
          <span className="text-muted-foreground">Trend: {trend}</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">Spending Volatility: 35%</p>
            <p className="text-muted-foreground">Idle Capital: 25%</p>
            <p className="text-muted-foreground">Income Stability: 25%</p>
            <p className="text-muted-foreground">User Preference: 15%</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-between h-auto p-0 hover:bg-transparent"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span className="text-xs text-muted-foreground">
            {showDetails ? 'Hide' : 'Show'} calculation breakdown
          </span>
          <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </Button>
      </div>
    </Card>
  );
}
