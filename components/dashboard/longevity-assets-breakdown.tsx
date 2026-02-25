'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

interface LongevityAsset {
  name: string;
  allocation: number;
  value: number;
  apy: number;
  description: string;
}

export function LongevityAssetsBreakdown() {
  const [expanded, setExpanded] = useState(true);
  
  const assets: LongevityAsset[] = [
    {
      name: 'Ethereum Staking',
      allocation: 45,
      value: 16875,
      apy: 3.2,
      description: 'Proof-of-stake rewards from Ethereum validators',
    },
    {
      name: 'Yield Farming (Aave)',
      allocation: 30,
      value: 11250,
      apy: 5.8,
      description: 'Liquidity provider yields from decentralized finance',
    },
    {
      name: 'Longevity Insurance',
      allocation: 15,
      value: 5625,
      apy: 4.5,
      description: 'Index-linked insurance for extended lifespan events',
    },
    {
      name: 'Digital Assets Reserve',
      allocation: 10,
      value: 3750,
      apy: 0.0,
      description: 'Reserve stablecoin holdings for liquidity',
    },
  ];

  const totalValue = 37500; // 30% of 125,000
  const totalExpectedYield = assets.reduce((sum, asset) => sum + (asset.value * asset.apy / 100), 0);

  return (
    <Card className="bg-card border-border p-6 hover:border-accent/50 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-foreground font-semibold">Longevity Assets Breakdown</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-auto p-1 hover:bg-muted"
        >
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </div>

      {expanded && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground text-xs mb-1">Total Value</p>
              <p className="text-2xl font-bold text-accent">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground text-xs mb-1">Expected Annual Yield</p>
              <p className="text-2xl font-bold text-green-400">
                ${totalExpectedYield.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Asset Details */}
          <div className="space-y-4 mb-6">
            {assets.map((asset, idx) => (
              <div
                key={idx}
                className="bg-muted/20 rounded-lg p-4 hover:bg-muted/40 transition-colors cursor-default border border-border hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-foreground font-semibold text-sm">{asset.name}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{asset.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-semibold text-sm">{asset.apy}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-muted-foreground">Allocation</span>
                    <span className="text-foreground font-semibold">{asset.allocation}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-accent to-cyan-400 h-1.5 rounded-full"
                      style={{ width: `${asset.allocation}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs mt-3 pt-3 border-t border-border">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="text-foreground font-semibold">
                    ${asset.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Longevity assets are designed for long-term growth and retirement optimization. APY figures are simulated and based on current market conditions.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
