import React from 'react';
import { Atmosphere } from '@/components/effects/Atmosphere';
import { FloatingNav } from '@/components/layout/FloatingNav';
import { useAppStore } from '@/lib/store';

export function Shell({ children }: { children: React.ReactNode }) {
  const { hasSeenIntro } = useAppStore();

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-white">
      <Atmosphere />
      
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {children}
      </main>

      {hasSeenIntro && <FloatingNav />}
    </div>
  );
}
