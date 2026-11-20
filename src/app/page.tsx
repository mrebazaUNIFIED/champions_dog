'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiCalendar, FiShield, FiUser } from 'react-icons/fi';
import { Card } from '../components/common/Card';
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

  return (
    <div className="space-y-6">
      <div
        className="panel-dark relative overflow-hidden p-8"
        style={
          info.bannerUrl
            ? {
                backgroundImage: `linear-gradient(0deg, rgba(6,35,26,0.78), rgba(6,35,26,0.55)), url(${info.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!info.bannerUrl && (
          <>
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-gold-500/10 blur-[90px]" />
          </>
        )}
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20">
            <Image src="/logo.jpg" alt="Perros Locos" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{info.name}</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {period && (
          <span className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-ink-700">
            <FiCalendar className="text-brand-600" /> {period}
          </span>
        )}
        <span className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-ink-700">
          <span className="h-2 w-2 rounded-full bg-brand-500" /> {TOURNAMENT_STATUS_LABELS[info.status]}
        </span>
        {info.organizer && (
          <span className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-ink-700">
            <FiUser className="text-brand-600" /> {info.organizer}
          </span>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-ink-900">Equipos</h3>
          <p className="text-sm text-ink-500">{teams.length} inscritos</p>
        </div>
        {teams.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center text-ink-400">
            <FiShield className="text-3xl" />
            Todavía no cargaste ningún equipo.
            <Link href="/equipos" className="text-sm font-medium text-brand-600 hover:underline">
              Ir a Equipos
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {teams.map((team) => (
              <Link
                key={team.id}
                href="/equipos"
                className="flex flex-col items-center gap-2 rounded-xl border border-surface-200 bg-surface-0 p-4 text-center transition hover:border-brand-400 hover:shadow-sm"
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <TeamBadge name={team.name} color={team.color} size={48} />
                )}
                <p className="w-full truncate text-sm font-medium text-ink-900">{team.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
