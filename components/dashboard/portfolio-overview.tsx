'use client';

import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PortfolioOverviewProps {
  value: number;
}

export function PortfolioOverview({ value }: PortfolioOverviewProps) {
  const [showValue, setShowValue] = useState(true);
  const projectedGain = value * 0.12; // Simulate 12% annual gain

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border p-6 cursor-default hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold">Portfolio Value</h3>
        <button
          onClick={() => setShowValue(!showValue)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={showValue ? 'Hide portfolio value' : 'Show portfolio value'}
        >
          {showValue ? (
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      </div>
      <div className="mb-6">
        <div className="text-3xl font-bold text-primary mb-2 transition-opacity duration-200">
          {showValue ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '••••••'}
        </div>
        <p className="text-muted-foreground text-sm">Total assets under management</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">12-Month Projection</span>
          <span className="text-green-400 font-semibold">
            +${projectedGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Projected Return</span>
          <span className="text-green-400 font-semibold">+12.0%</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Projections based on historical performance and current allocation strategy.
        </p>
      </div>
    </Card>
  );
}
