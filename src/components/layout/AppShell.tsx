'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DogLoader } from '../common/DogLoader';
import { useBootstrap } from '../../hooks/useBootstrap';
import Header from './Header';

export default function AppShell({ children }: { children: ReactNode }) {
  const { ready } = useBootstrap();
  const pathname = usePathname();

  // El overlay de OBS (src/app/overlay) es una pieza gráfica aparte: sin header, sin
  // márgenes y sin la pantalla de carga del resto de la app.
  if (pathname?.startsWith('/overlay')) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-8">
        <DogLoader className="h-auto w-3/4 max-w-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-margin pb-space-xl pt-24 md:px-margin-tablet">{children}</main>
    </div>
  );
}
