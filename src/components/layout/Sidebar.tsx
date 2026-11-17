'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NAV_ITEMS } from './navItems';

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-pitch-900/90 text-white lg:hidden"
        aria-label="Abrir menú"
      >
        <FiMenu />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/8 bg-pitch-900/95 transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-black/20 ring-1 ring-white/15">
              <Image src="/logo.jpg" alt="Perros Locos" width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-white">4.º Campeonato</p>
              <p className="font-display text-sm font-semibold leading-tight text-brand-400">Perritos Locos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/70 lg:hidden"
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>

        <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
          Selección de equipos
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-white text-ink-900 shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className={clsx('text-base', active ? 'text-brand-600' : 'text-white/40')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mb-6 rounded-xl border border-white/10 bg-pitch-800/80 p-4 text-xs text-white/50">
          <p className="font-display font-semibold text-white/80">6 equipos siempre</p>
          <p className="mt-1">La formación y los puntajes se configuran en &quot;Configuración del campeonato&quot;.</p>
        </div>
      </aside>
    </>
  );
}
