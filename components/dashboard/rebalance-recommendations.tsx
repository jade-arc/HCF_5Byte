'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function RebalanceRecommendations() {
  const [expanded, setExpanded] = useState(true);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExecuting(false);
  };

  return (
    <Card className="bg-gradient-to-r from-orange-400/10 to-red-400/10 border border-orange-400/30 p-6 hover:border-orange-400/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <AlertTriangle className="h-6 w-6 text-orange-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-foreground font-semibold mb-2">Rebalance Recommended</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your portfolio has drifted 6.2% from the target 70/30 allocation due to market movements. Rebalancing will restore optimal risk management and longevity positioning.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-auto p-1 flex-shrink-0 hover:bg-muted"
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
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Traditional</span>
                  <span className="text-foreground font-semibold">73.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Traditional</span>
                  <span className="text-foreground font-semibold">70.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift Required</span>
                  <span className="text-orange-400 font-semibold">-$2,850 to Longevity</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-background disabled:opacity-50"
                  onClick={handleExecute}
                  disabled={executing}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {executing ? 'Executing...' : 'Execute Rebalance'}
                </Button>
                <Button size="sm" variant="outline" className="border-border hover:bg-muted">
                  View Details
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
