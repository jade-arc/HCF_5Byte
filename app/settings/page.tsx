'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/header';
import { MessageCircle, Plus, Trash2, CheckCircle } from 'lucide-react';

interface ConnectedPhone {
  id: string;
  number: string;
  verified: boolean;
  lastSync: string;
}

export default function SettingsPage() {
  const [phones, setPhones] = useState<ConnectedPhone[]>([
    {
      id: '1',
      number: '+1 (555) 123-4567',
      verified: true,
      lastSync: '2024-01-20 14:32',
    },
  ]);
  const [newPhone, setNewPhone] = useState('');
  const [smsMessages, setSmsMessages] = useState<string[]>([]);
  const [ingesting, setIngesting] = useState(false);

  const handleAddPhone = () => {
    if (newPhone) {
      setPhones([
        ...phones,
        {
          id: Date.now().toString(),
          number: newPhone,
          verified: false,
          lastSync: 'Never',
        },
      ]);
      setNewPhone('');
    }
  };

  const handleRemovePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  const handleIngestSMS = async () => {
    if (smsMessages.length === 0) return;

    setIngesting(true);
    try {
      const response = await fetch('/api/transactions/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          smsMessages,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Ingested ${data.successful} transactions successfully`);
        setSmsMessages([]);
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      alert('Failed to ingest transactions');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* SMS Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connected Phones */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">SMS Integration</h2>
            </div>

            <div className="space-y-4 mb-6">
              {phones.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-foreground font-semibold text-sm">{phone.number}</p>
                      <p className="text-muted-foreground text-xs">Last sync: {phone.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {phone.verified && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePhone(phone.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground text-sm block mb-2">
                  Add Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleAddPhone}
                className="w-full bg-primary hover:bg-primary/90 text-background"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone
              </Button>
            </div>
          </Card>

          {/* Test SMS Ingestion */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Test SMS Ingestion</h2>

            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm block mb-2">
                  Paste SMS Messages (one per line)
                </label>
                <textarea
                  value={smsMessages.join('\n')}
                  onChange={(e) =>
                    setSmsMessages(
                      e.target.value
                        .split('\n')
                        .filter((msg) => msg.trim().length > 0)
                    )
                  }
                  placeholder={`Chase: Your purchase of $45.99 at Coffee Shop on 01/20 was approved. Remaining balance: $4,254.01`}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                />
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground text-xs mb-2">Example SMS formats:</p>
                <ul className="text-muted-foreground text-xs space-y-1">
                  <li>• "Wells Fargo: You spent $24.99 at WHOLE FOODS"</li>
                  <li>• "AMEX: Payment received $500 on 1/20"</li>
                  <li>• "Bank of America: Transfer of $1000 sent"</li>
                </ul>
              </div>

              <Button
                onClick={handleIngestSMS}
                disabled={smsMessages.length === 0 || ingesting}
                className="w-full bg-accent hover:bg-accent/90 text-background disabled:opacity-50"
              >
                {ingesting ? 'Processing...' : 'Ingest Transactions'}
              </Button>

              {smsMessages.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {smsMessages.length} message(s) ready to process
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Risk Profile Settings */}
        <Card className="bg-card border-border p-6 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Risk Profile & Preferences</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-muted-foreground text-sm block mb-3">
                Risk Profile
              </label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground text-sm block mb-3">
                Rebalance Threshold (%)
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground text-sm block mb-3">
                Volatility Threshold (%)
              </label>
              <input
                type="number"
                defaultValue="25"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button className="mt-6 bg-primary hover:bg-primary/90 text-background">
            Save Preferences
          </Button>
        </Card>

        {/* Notifications Section */}
        <Card className="bg-card border-border p-6 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Notification Settings</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Email alerts for rebalancing recommendations</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">SMS alerts for idle capital detection</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Weekly portfolio summary report</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-foreground">Risk threshold breach notifications</span>
            </label>
          </div>

          <Button className="mt-6 bg-primary hover:bg-primary/90 text-background">
            Save Notifications
          </Button>
        </Card>
      </main>
    </div>
  );
}
