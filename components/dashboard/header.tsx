import { Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wealth Platform</h1>
          <p className="text-muted-foreground text-sm">
            AI-Powered Retirement Portfolio Optimizer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
