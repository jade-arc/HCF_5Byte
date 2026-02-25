'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, AlertCircle, Download } from 'lucide-react';

interface ComplianceCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

interface ComplianceData {
  overallStatus: 'compliant' | 'warning' | 'non-compliant';
  lastAudit: string;
  checks: ComplianceCheck[];
  violations: any[];
  recommendations: string[];
}

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading compliance data
    const timer = setTimeout(() => {
      setData({
        overallStatus: 'compliant',
        lastAudit: '2024-01-20T14:32:00Z',
        checks: [
          {
            name: 'Allocation Drift',
            status: 'pass',
            message: 'Portfolio allocation drift is 3.2%, within 5% policy threshold',
          },
          {
            name: 'Portfolio Volatility',
            status: 'pass',
            message: 'Portfolio volatility at 18.5%, below 25% threshold',
          },
          {
            name: 'Rebalance Frequency',
            status: 'warning',
            message: 'Last rebalance 92 days ago; recommend quarterly review',
          },
          {
            name: 'Risk Suitability',
            status: 'pass',
            message: 'Portfolio allocation matches moderate risk profile',
          },
          {
            name: 'Market Hours Compliance',
            status: 'pass',
            message: 'All trades executed during US market hours',
          },
          {
            name: 'Minimum Balance',
            status: 'pass',
            message: 'All holdings exceed $100 minimum balance',
          },
        ],
        violations: [
          {
            severity: 'info',
            date: '2024-01-15',
            description: 'Portfolio rebalancing recommended',
            status: 'Pending user action',
          },
        ],
        recommendations: [
          'Schedule quarterly portfolio rebalance (due in 14 days)',
          'Review and update risk profile annually',
          'Monitor allocation drift; rebalance if drift exceeds 5%',
          'Consider increasing frequency of risk score calculations to weekly',
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
          <p className="text-foreground mt-4">Loading compliance report...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-400/10 border-green-400/30 text-green-400';
      case 'warning':
        return 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400';
      case 'non-compliant':
        return 'bg-red-400/10 border-red-400/30 text-red-400';
      default:
        return 'bg-gray-400/10 border-gray-400/30 text-gray-400';
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Compliance Report</h2>
          <Button className="bg-primary hover:bg-primary/90 text-background">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Overall Status */}
        <Card className={`border p-6 mb-8 ${getStatusColor(data.overallStatus)}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">Overall Compliance Status</h3>
              <p className="text-sm opacity-90">
                Last audit: {new Date(data.lastAudit).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1 capitalize">
                {data.overallStatus.replace('-', ' ')}
              </div>
              <p className="text-xs opacity-75">
                {data.checks.filter((c) => c.status === 'pass').length}/{data.checks.length} checks passing
              </p>
            </div>
          </div>
        </Card>

        {/* Compliance Checks */}
        <Card className="bg-card border-border p-6 mb-8">
          <h3 className="text-foreground font-semibold mb-6">Compliance Checks</h3>

          <div className="space-y-4">
            {data.checks.map((check, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="mt-1">{getCheckIcon(check.status)}</div>
                <div className="flex-1">
                  <p className="text-foreground font-semibold text-sm">{check.name}</p>
                  <p className="text-muted-foreground text-sm mt-1">{check.message}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Violations */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground font-semibold mb-4">Recent Violations</h3>

            {data.violations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No violations detected</p>
            ) : (
              <div className="space-y-3">
                {data.violations.map((v, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start gap-2 mb-2">
                      {v.severity === 'critical' && (
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                      )}
                      {v.severity === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      )}
                      {v.severity === 'info' && (
                        <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                      )}
                      <div>
                        <p className="text-foreground text-sm font-semibold">{v.description}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {v.date} • {v.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground font-semibold mb-4">Action Items</h3>

            <div className="space-y-3">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <p className="text-foreground text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Policies Section */}
        <Card className="bg-card border-border p-6 mt-8">
          <h3 className="text-foreground font-semibold mb-6">Risk Governance Policies</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground text-sm mb-2">Max Allocation Drift</p>
                <p className="text-2xl font-bold text-foreground">5.0%</p>
                <p className="text-xs text-muted-foreground mt-2">Current: 3.2%</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground text-sm mb-2">Max Portfolio Volatility</p>
                <p className="text-2xl font-bold text-foreground">25.0%</p>
                <p className="text-xs text-muted-foreground mt-2">Current: 18.5%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground text-sm mb-2">Rebalance Interval</p>
                <p className="text-2xl font-bold text-foreground">180 days</p>
                <p className="text-xs text-muted-foreground mt-2">Last rebalance: 92 days ago</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground text-sm mb-2">Max Trade Size</p>
                <p className="text-2xl font-bold text-foreground">20.0%</p>
                <p className="text-xs text-muted-foreground mt-2">Portfolio value</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Trail */}
        <Card className="bg-card border-border p-6 mt-8">
          <h3 className="text-foreground font-semibold mb-6">Audit Trail</h3>

          <p className="text-muted-foreground text-sm mb-4">
            All portfolio actions are logged and tracked for compliance purposes.
          </p>

          <Button variant="outline" className="border-border hover:bg-muted">
            View Detailed Audit Log
          </Button>
        </Card>
      </main>
    </div>
  );
}
