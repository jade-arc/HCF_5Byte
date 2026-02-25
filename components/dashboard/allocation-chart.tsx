'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface AllocationChartProps {
  traditional: number;
  longevity: number;
}

export function AllocationChart({ traditional, longevity }: AllocationChartProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const data = [
    {
      name: 'Traditional Assets',
      value: traditional,
      fill: '#10b981',
    },
    {
      name: 'Longevity Assets',
      value: longevity,
      fill: '#06b6d4',
    },
  ];

  return (
    <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
      <h3 className="text-foreground font-semibold mb-6">70/30 Portfolio Allocation</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredSection(data[index].name)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  opacity={hoveredSection === null || hoveredSection === entry.name ? 1 : 0.5}
                  style={{ transition: 'opacity 0.2s ease' }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a202c',
                border: '1px solid #2d3748',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `${value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 space-y-3">
        <p className="text-xs text-muted-foreground">
          Traditional assets: stocks, bonds, ETFs. Longevity assets: staking, yield farming, insurance.
        </p>
      </div>
    </Card>
  );
}
