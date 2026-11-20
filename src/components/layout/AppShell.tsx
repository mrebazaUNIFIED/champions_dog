'use client';

import type { ReactNode } from 'react';
import { useBootstrap } from '../../hooks/useBootstrap';
import Header from './Header';

export default function AppShell({ children }: { children: ReactNode }) {
  useBootstrap();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-margin pb-space-xl pt-24 md:px-margin-tablet">{children}</main>
    </div>
  );
}
