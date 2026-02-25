'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/contexts/theme-context';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="border-border hover:bg-muted gap-2"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Dark</span>
        </>
      )}
    </Button>
  );
}
