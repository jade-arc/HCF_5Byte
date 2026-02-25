'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Download } from 'lucide-react';

export function TransactionSummary() {
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | 'ytd'>('6m');
  
  // Generate 24 months of data (2 years)
  const allMonthsData = [
    // 2024
    { month: 'Jan 24', spending: 3600, income: 5000 },
    { month: 'Feb 24', spending: 3800, income: 5000 },
    { month: 'Mar 24', spending: 4100, income: 5200 },
    { month: 'Apr 24', spending: 3900, income: 5200 },
    { month: 'May 24', spending: 4300, income: 5300 },
    { month: 'Jun 24', spending: 4200, income: 5200 },
    { month: 'Jul 24', spending: 4500, income: 5400 },
    { month: 'Aug 24', spending: 4100, income: 5200 },
    { month: 'Sep 24', spending: 4400, income: 5300 },
    { month: 'Oct 24', spending: 3900, income: 5200 },
    { month: 'Nov 24', spending: 4600, income: 5500 },
    { month: 'Dec 24', spending: 5100, income: 5800 },
    // 2025
    { month: 'Jan 25', spending: 4200, income: 5300 },
    { month: 'Feb 25', spending: 4100, income: 5200 },
    { month: 'Mar 25', spending: 4300, income: 5300 },
    { month: 'Apr 25', spending: 4400, income: 5400 },
    { month: 'May 25', spending: 4150, income: 5250 },
    { month: 'Jun 25', spending: 4350, income: 5350 },
    { month: 'Jul 25', spending: 4500, income: 5500 },
    { month: 'Aug 25', spending: 4200, income: 5300 },
    { month: 'Sep 25', spending: 4450, income: 5400 },
    { month: 'Oct 25', spending: 4100, income: 5200 },
    { month: 'Nov 25', spending: 4550, income: 5450 },
    { month: 'Dec 25', spending: 5000, income: 5700 },
  ];

  // Filter data based on timeframe
  const get6mData = () => allMonthsData.slice(-6);
  const get12mData = () => allMonthsData.slice(-12);
  const getYtdData = () => {
    // YTD 2025 (Jan-Dec 2025)
    return allMonthsData.slice(12);
  };

  const data = timeframe === '6m' ? get6mData() : timeframe === '12m' ? get12mData() : getYtdData();

  return (
    <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-foreground font-semibold">Income vs Spending ({timeframe === '6m' ? '6 Months' : timeframe === '12m' ? '12 Months' : 'Year to Date'})</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={timeframe === '6m' ? 'default' : 'outline'}
            className={timeframe === '6m' ? 'bg-primary' : 'border-border hover:bg-muted'}
            onClick={() => setTimeframe('6m')}
          >
            6M
          </Button>
          <Button
            size="sm"
            variant={timeframe === '12m' ? 'default' : 'outline'}
            className={timeframe === '12m' ? 'bg-primary' : 'border-border hover:bg-muted'}
            onClick={() => setTimeframe('12m')}
          >
            12M
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'ytd' ? 'default' : 'outline'}
            className={timeframe === 'ytd' ? 'bg-primary' : 'border-border hover:bg-muted'}
            onClick={() => setTimeframe('ytd')}
          >
            YTD
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border hover:bg-muted ml-auto md:ml-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a202c',
                border: '1px solid #2d3748',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="spending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Average Monthly Spending</p>
          <p className="text-2xl font-bold text-foreground">$4,200</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Average Monthly Income</p>
          <p className="text-2xl font-bold text-foreground">$5,260</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Spending patterns are analyzed to detect trends and inform rebalancing decisions. Higher spending volatility may trigger more frequent portfolio adjustments.
        </p>
      </div>
    </Card>
  );
}
