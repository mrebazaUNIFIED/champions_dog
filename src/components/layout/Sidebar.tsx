'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NAV_GROUPS, NAV_ITEMS } from './navItems';

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
        <div className="flex min-w-0 items-center justify-between px-6 py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-black/20 ring-1 ring-white/15">
              <Image src="/logo.jpg" alt="Perros Locos" width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/50">4.º Campeonato</p>
              <p className="font-display text-2xl leading-none text-white">Perros Locos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 text-white/70 lg:hidden"
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group}>
              <p className="px-3 pb-1.5 text-[11px] font-medium text-white/35">{group}</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        'relative flex items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 text-sm font-medium transition-colors',
                        active ? 'bg-white text-ink-900 shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {active && (
                        <span className="absolute left-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-brand-500" />
                      )}
                      <Icon className={clsx('shrink-0 text-base', active ? 'text-brand-600' : 'text-white/40')} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
