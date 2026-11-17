'use client';

import type { ReactNode } from 'react';
import { useBootstrap } from '../../hooks/useBootstrap';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: ReactNode }) {
  useBootstrap();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
