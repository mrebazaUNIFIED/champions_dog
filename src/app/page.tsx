'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Icon } from '../components/common/Icon';
import { Card } from '../components/common/Card';
import { MedalIcon, TrophyIcon } from '../components/common/PrizeIcons';
import { TeamBadge } from '../components/common/TeamBadge';
import { useTeamsStore } from '../store/useTeamsStore';
import { useTournamentInfoStore } from '../store/useTournamentInfoStore';
import { TOURNAMENT_STATUS_LABELS } from '../types';

function formatDate(value?: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export default function DashboardPage() {
  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);

  const info = useTournamentInfoStore((s) => s.info);
  const infoLoaded = useTournamentInfoStore((s) => s.loaded);
  const loadInfo = useTournamentInfoStore((s) => s.load);

  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);

  useEffect(() => {
    if (!infoLoaded) void loadInfo();
  }, [infoLoaded, loadInfo]);

  const periodStart = formatDate(info.periodStart);
  const periodEnd = formatDate(info.periodEnd);
  const period = periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : null;

  const PREMIO_GOLD = '#eab308';
  const PREMIO_SILVER = '#9ca3af';
  const PREMIO_GREEN = '#00a86b';

  const premios = [
    { icon: <TrophyIcon place={1} color={PREMIO_GOLD} />, label: 'Campeón', lines: ['S/ 1,000'], color: PREMIO_GOLD },
    { icon: <TrophyIcon place={2} color={PREMIO_SILVER} />, label: 'Subcampeón', lines: ['S/ 400'], color: PREMIO_SILVER },
    {
      icon: <MedalIcon color={PREMIO_GREEN} />,
      label: 'Goleador',
      lines: ['S/ 50'],
      color: PREMIO_GREEN,
    },
  ];

  return (
    <div className="space-y-6">
      <div className=" overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
        <div className="relative">
          {info.bannerUrl ? (
            <div
              className="w-full"
              style={{
                aspectRatio: '1640 / 664',
                backgroundImage: `url(${info.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <div className="relative aspect-[1640/664] w-full overflow-hidden bg-on-primary-container">
              <div
                className="pointer-events-none absolute -right-6 top-0 h-full w-48 bg-primary-container/20"
                style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0% 100%)' }}
              />
            </div>
          )}
          <div className="absolute -bottom-12 left-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-lowest bg-surface-container-lowest shadow-lg">
            <Image src="/logo.jpg" alt="Perros Locos" width={112} height={112} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="px-6 pb-6 pt-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">{info.name}</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {period && (
              <div className="flex flex-col items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                <Icon name="calendar_month" className="text-xl text-primary-fixed-dim" />
                <p className="font-label text-[10px] uppercase text-on-surface-variant">Período</p>
                <p className="text-sm font-medium text-on-surface">{period}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-container" />
              <p className="font-label text-[10px] uppercase text-on-surface-variant">Estado</p>
              <p className="text-sm font-medium text-on-surface">{TOURNAMENT_STATUS_LABELS[info.status]}</p>
            </div>
            {info.organizer && (
              <div className="flex flex-col items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                <Icon name="person" className="text-xl text-primary-fixed-dim" />
                <p className="font-label text-[10px] uppercase text-on-surface-variant">Organizador</p>
                <p className="text-sm font-medium text-on-surface">{info.organizer}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-on-surface">Equipos</h3>
          <p className="text-sm text-on-surface-variant">{teams.length} inscritos</p>
        </div>
        {teams.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center text-on-surface-variant">
            <Icon name="shield" className="text-3xl" />
            Todavía no cargaste ningún equipo.
            <Link href="/equipos" className="text-sm font-medium text-primary-fixed-dim hover:underline">
              Ir a Equipos
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {teams.map((team) => (
              <Link
                key={team.id}
                href="/equipos"
                className="flex flex-col items-center gap-2 p-2 text-center transition hover:opacity-80"
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <TeamBadge name={team.name} color={team.color} size={56} circle />
                )}
                <p className="w-full truncate text-sm font-medium text-on-surface">{team.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-on-surface">Premios</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {premios.map((p) => (
            <div key={p.label} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center justify-center p-4">{p.icon}</div>
              <div style={{ borderTop: `3px solid ${p.color}` }} />
              <div className="flex flex-col items-center gap-0.5 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: p.color }}>
                  {p.label}
                </p>
                {p.lines.map((line) => (
                  <p key={line} className="text-xs font-medium text-on-surface">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
