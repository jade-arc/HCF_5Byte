'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  provider: 'gemini' | 'groq' | 'openai';
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

interface ApiKeyContextType {
  apiKeys: ApiKey[];
  activeKey: ApiKey | null;
  setActiveKey: (key: ApiKey | null) => void;
  addApiKey: (key: ApiKey) => void;
  removeApiKey: (id: string) => void;
  updateApiKey: (id: string, updates: Partial<ApiKey>) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKey, setActiveKey] = useState<ApiKey | null>(null);

  const addApiKey = useCallback((key: ApiKey) => {
    setApiKeys(prev => [...prev, key]);
  }, []);

  const removeApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    if (activeKey?.id === id) {
      setActiveKey(null);
    }
  }, [activeKey]);

  const updateApiKey = useCallback((id: string, updates: Partial<ApiKey>) => {
    setApiKeys(prev =>
      prev.map(k => (k.id === id ? { ...k, ...updates } : k))
    );
    if (activeKey?.id === id) {
      setActiveKey(prev => (prev ? { ...prev, ...updates } : null));
    }
  }, [activeKey]);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKeys,
        activeKey,
        setActiveKey,
        addApiKey,
        removeApiKey,
        updateApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
}
