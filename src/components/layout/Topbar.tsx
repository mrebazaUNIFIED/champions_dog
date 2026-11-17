'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './navItems';

export default function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((i) => i.href === pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-surface-200 bg-surface-0/90 px-6 py-4 pl-20 backdrop-blur lg:pl-6">
      <div>
        <p className="text-xs text-ink-400">4.º Campeonato Perritos Locos · Selección de Equipos</p>
        <h1 className="font-display text-xl font-bold text-ink-900">{current?.label ?? 'Dashboard'}</h1>
      </div>
    </header>
  );
}
