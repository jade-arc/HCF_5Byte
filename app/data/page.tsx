'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { useUserTransactions } from '@/hooks/use-user-transactions';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

const CATEGORIES = [
  'Groceries',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Dining',
  'Rent/Mortgage',
  'Salary',
  'Investments',
  'Insurance',
  'Subscriptions',
  'Other',
];

export default function DataInputPage() {
  const { addTransaction, transactions, removeTransaction } = useUserTransactions();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Other',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
  });
  const [csvText, setCsvText] = useState('');

  const handleAddTransaction = () => {
    setError(null);
    setSuccess(null);

    if (!formData.date || !formData.description || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    addTransaction({
      date: new Date(formData.date),
      description: formData.description,
      category: formData.category,
      amount: formData.amount,
      type: formData.type,
    });

    setSuccess('Transaction added successfully!');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Other',
      amount: 0,
      type: 'expense',
    });

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImportCSV = () => {
    setError(null);
    setSuccess(null);

    if (!csvText.trim()) {
      setError('Please paste CSV data');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must have header row and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dateIdx = headers.indexOf('date');
      const descIdx = headers.indexOf('description') >= 0 ? headers.indexOf('description') : headers.indexOf('merchant');
      const amountIdx = headers.indexOf('amount');
      const typeIdx = headers.indexOf('type');
      const categoryIdx = headers.indexOf('category');

      if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
        setError('CSV must have columns: date, description (or merchant), amount');
        return;
      }

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 3) continue;

        try {
          const txDate = new Date(values[dateIdx]);
          const txAmount = parseFloat(values[amountIdx]);
          const txType = (values[typeIdx] || 'expense').toLowerCase() as 'income' | 'expense';

          if (isNaN(txAmount)) continue;

          addTransaction({
            date: txDate,
            description: values[descIdx],
            category: categoryIdx >= 0 ? values[categoryIdx] : 'Other',
            amount: txAmount,
            type: txType,
          });
          imported++;
        } catch (e) {
          continue;
        }
      }

      if (imported === 0) {
        setError('No valid transactions could be imported');
        return;
      }

      setSuccess(`Successfully imported ${imported} transactions!`);
      setCsvText('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to parse CSV: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Add Transaction Data</h1>
            </div>
          <p className="text-muted-foreground">
            Manually input transactions or upload via CSV. The AI will analyze this data to optimize your portfolio.
          </p>
        </div>

        {error && (
          <Card className="bg-red-500/10 border border-red-500/30 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="bg-green-500/10 border border-green-500/30 p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Manual Entry */}
          <Card className="lg:col-span-1 bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Manual Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Input
                  placeholder="e.g., Whole Foods groceries"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <Button onClick={handleAddTransaction} className="w-full bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </Card>

          {/* CSV Upload */}
          <Card className="lg:col-span-2 bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Bulk Import (CSV)</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Paste CSV Data</label>
                <textarea
                  placeholder={`date,description,category,amount,type
2024-01-15,Whole Foods groceries,Groceries,45.50,expense
2024-01-16,Tech Company,Salary,5000,income
2024-01-17,Electricity bill,Utilities,125.00,expense`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 font-mono text-sm min-h-40"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Required columns: date, description, amount, type. Optional: category
              </p>
              <Button
                onClick={handleImportCSV}
                disabled={!csvText}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </Card>
        </div>

        {/* Transactions List */}
        {transactions.length > 0 && (
          <Card className="bg-card border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Your Transactions</h2>
                <p className="text-sm text-muted-foreground">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between bg-muted p-4 rounded-lg hover:bg-muted/80 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.date.toLocaleDateString()} • {tx.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-semibold min-w-20 text-right ${tx.type === 'income' ? 'text-green-400' : 'text-foreground'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTransaction(tx.id)}
                      className="hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {transactions.length === 0 && (
          <Card className="bg-muted/30 border border-dashed border-border p-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Add transactions using the form above or import from CSV</p>
          </Card>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
