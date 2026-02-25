'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Copy, Eye, EyeOff, Trash2, Plus, Check, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

interface StoredApiKey {
  id: string;
  name: string;
  key: string;
  provider: 'gemini' | 'groq' | 'openai' | 'anthropic';
  maskedKey: string;
  createdAt: Date;
  active: boolean;
}

const STORAGE_KEY = 'wealth_api_keys';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<StoredApiKey[]>([]);
  const [form, setForm] = useState({
    name: '',
    key: '',
    provider: 'gemini' as const,
  });

  const [showKey, setShowKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys(parsed.map((k: any) => ({
          ...k,
          createdAt: new Date(k.createdAt),
        })));
      }
    } catch (error) {
      console.error('[v0] Failed to load API keys:', error);
    }
    setIsLoaded(true);
  }, []);

  const maskApiKey = (key: string): string => {
    if (key.length < 8) return '••••••••';
    return key.substring(0, 4) + '•'.repeat(Math.max(4, key.length - 8)) + key.slice(-4);
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Please provide a name for this API key');
      return;
    }

    if (!form.key.trim()) {
      setFormError('Please provide an API key');
      return;
    }

    const newKey: StoredApiKey = {
      id: `key_${Date.now()}`,
      name: form.name,
      key: form.key,
      provider: form.provider,
      maskedKey: maskApiKey(form.key),
      createdAt: new Date(),
      active: keys.length === 0, // First key is active by default
    };

    const updated = [...keys, newKey];
    setKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setForm({ name: '', key: '', provider: 'gemini' });
  };

  const handleRemoveKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    setKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSetActive = (id: string) => {
    const updated = keys.map(k => ({
      ...k,
      active: k.id === id,
    }));
    setKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeKey = keys.find(k => k.active);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-foreground mt-4">Loading API keys...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground mb-2">API Key Management</h1>
          <p className="text-muted-foreground">
            Add your AI provider API keys to enable dynamic data analysis and portfolio optimization. Keys are stored locally in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Key Form */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border p-6 sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Add New API Key</h2>
              
              <form onSubmit={handleAddKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Key Name
                  </label>
                  <Input
                    placeholder="e.g., My Gemini API"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Provider
                  </label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                    className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    API Key
                  </label>
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Paste your API key here"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {formError && (
                  <div className="flex gap-2 items-start p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{formError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted flex-1"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-background flex-1 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Key
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground border-t border-border pt-4">
                  Your API keys are stored locally in your browser and never sent to our servers.
                </p>
              </form>
            </Card>
          </div>

          {/* Keys List */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Your API Keys</h2>
                <span className="text-sm text-muted-foreground">
                  {keys.length} key{keys.length !== 1 ? 's' : ''}
                </span>
              </div>

              {keys.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-foreground font-medium">No API keys added yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add an API key to enable AI-powered analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        key.active
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-muted/30 border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground truncate">{key.name}</h3>
                            {key.active && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium flex-shrink-0">
                                <Check className="h-3 w-3" />
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-xs bg-background px-2 py-1 rounded font-mono text-muted-foreground">
                              {key.maskedKey}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto hover:bg-muted"
                              onClick={() => handleCopyKey(key.key, key.id)}
                            >
                              {copiedId === key.id ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {key.provider.toUpperCase()} • Added {key.createdAt.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {!key.active && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border hover:bg-muted text-xs"
                              onClick={() => handleSetActive(key.id)}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 p-2 h-auto"
                            onClick={() => handleRemoveKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {activeKey && (
              <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-6 mt-6">
                <h3 className="font-semibold text-foreground mb-2">Active API Key</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The active key is used for all AI-powered analysis and portfolio optimization.
                </p>
                <div className="p-3 bg-background rounded border border-border">
                  <p className="text-xs text-muted-foreground">Active Key Name</p>
                  <p className="font-mono text-sm text-foreground">{activeKey.name}</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Information Section */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-6 mt-8">
          <h3 className="font-semibold text-foreground mb-4">How to Get Your API Keys</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="font-medium text-foreground mb-2">Google Gemini</p>
              <p className="text-xs text-muted-foreground mb-3">
                Free API key for generative AI
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted w-full text-xs"
                asChild
              >
                <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Groq</p>
              <p className="text-xs text-muted-foreground mb-3">
                Ultra-fast LLM inference
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted w-full text-xs"
                asChild
              >
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">OpenAI</p>
              <p className="text-xs text-muted-foreground mb-3">
                Advanced AI models
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted w-full text-xs"
                asChild
              >
                <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Anthropic Claude</p>
              <p className="text-xs text-muted-foreground mb-3">
                Safe & capable AI
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted w-full text-xs"
                asChild
              >
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
}
