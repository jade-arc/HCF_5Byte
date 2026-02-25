'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  tags?: string[];
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  averageExpense: number;
  largestExpense: number;
  categoryBreakdown: Record<string, number>;
}

const STORAGE_KEY = 'wealth_platform_transactions';

export function useUserTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    averageExpense: 0,
    largestExpense: 0,
    categoryBreakdown: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const transactions = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(transactions);
        calculateStats(transactions);
      }
    } catch (error) {
      console.error('[v0] Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((txns: Transaction[]) => {
    const totalIncome = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const expenses = txns.filter(t => t.type === 'expense');
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const largestExpense = Math.max(...expenses.map(t => t.amount), 0);

    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    setStats({
      totalIncome,
      totalExpenses,
      balance,
      averageExpense,
      largestExpense,
      categoryBreakdown,
    });
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      calculateStats(updated);
      return updated;
    });

    return newTransaction;
  }, [calculateStats]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      calculateStats(updated);
      return updated;
    });
  }, [calculateStats]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      calculateStats(updated);
      return updated;
    });
  }, [calculateStats]);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
    setStats({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      averageExpense: 0,
      largestExpense: 0,
      categoryBreakdown: {},
    });
  }, []);

  const importTransactions = useCallback((txns: Transaction[]) => {
    setTransactions(txns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
    calculateStats(txns);
  }, [calculateStats]);

  return {
    transactions,
    stats,
    isLoading,
    addTransaction,
    removeTransaction,
    updateTransaction,
    clearAllTransactions,
    importTransactions,
  };
}
