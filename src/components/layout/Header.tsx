'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { useTheme } from '../../hooks/useTheme';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import { NAV_ITEMS } from './navItems';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const players = usePlayersStore((s) => s.players);
  const teams = useTeamsStore((s) => s.teams);
  const { theme, toggleTheme } = useTheme();

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return { players: [], teams: [] };
    return {
      players: players.filter((p) => p.fullName.toLowerCase().includes(term)).slice(0, 5),
      teams: teams.filter((t) => t.name.toLowerCase().includes(term)).slice(0, 5),
    };
  }, [search, players, teams]);

  function goTo(href: string) {
    setSearch('');
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(href);
  }

  const hasResults = results.players.length > 0 || results.teams.length > 0;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface/85 backdrop-blur-xl">
      <div className="flex h-20 w-full items-center justify-between gap-gutter px-margin md:px-margin-tablet">
        <div className="flex min-w-0 items-center gap-space-lg">
          <Link href="/" className="group flex shrink-0 items-center gap-space-sm">
            <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-outline-variant transition-transform group-hover:scale-105">
              <Image src="/logo.jpg" alt="Perros Locos" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-display text-headline-sm uppercase tracking-wide text-on-surface">Perros Locos</span>
              <span className="font-label text-[10px] text-primary-fixed-dim">4.º Campeonato</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-space-xs xl:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'rounded-lg px-space-md py-space-sm text-sm font-medium transition-colors',
                    active
                      ? 'bg-on-primary-container font-bold text-white'
                      : 'text-on-surface-variant hover:bg-on-primary-container hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="relative hidden md:block" ref={searchRef}>
            <Icon name="search" className="pointer-events-none absolute left-space-sm top-1/2 -translate-y-1/2 text-base text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Buscar jugador o equipo…"
              className="w-56 rounded bg-surface-container-low py-space-xs pl-9 pr-space-sm text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-high lg:w-64"
            />
            {searchOpen && search && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-xl">
                {!hasResults && <p className="px-4 py-3 text-sm text-on-surface-variant">Sin resultados.</p>}
                {results.players.length > 0 && (
                  <div className="py-1">
                    <p className="px-4 pb-1 pt-2 font-label text-[10px] text-on-surface-variant">Jugadores</p>
                    {results.players.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => goTo('/jugadores')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest"
                      >
                        <Icon name="person" className="text-base text-on-surface-variant" />
                        {p.fullName}
                      </button>
                    ))}
                  </div>
                )}
                {results.teams.length > 0 && (
                  <div className="border-t border-outline-variant py-1">
                    <p className="px-4 pb-1 pt-2 font-label text-[10px] text-on-surface-variant">Equipos</p>
                    {results.teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => goTo('/equipos')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest"
                      >
                        <Icon name="shield" className="text-base text-on-surface-variant" />
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface xl:hidden"
            aria-label="Abrir menú"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-outline-variant bg-surface-container-lowest px-margin py-space-md xl:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-space-sm rounded-lg px-space-md py-space-sm text-sm font-medium',
                  active ? 'bg-on-primary-container text-white' : 'text-on-surface-variant hover:bg-on-primary-container hover:text-white',
                )}
              >
                <Icon name={item.icon} className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
