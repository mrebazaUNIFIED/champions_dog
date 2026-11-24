'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { Icon } from '../components/common/Icon';
import { Card } from '../components/common/Card';
import { MatchStatusBadge } from '../components/common/Badges';
import { TeamBadge } from '../components/common/TeamBadge';
import { usePlayersStore } from '../store/usePlayersStore';
import { useMatchesStore } from '../store/useMatchesStore';
import { useTeamsStore } from '../store/useTeamsStore';
import { useTournamentInfoStore } from '../store/useTournamentInfoStore';
import { matchScore, topScorers, TOURNAMENT_STATUS_LABELS, type Match } from '../types';

function formatDate(value?: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function formatDateTime(value?: string): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);

  const info = useTournamentInfoStore((s) => s.info);
  const infoLoaded = useTournamentInfoStore((s) => s.loaded);
  const loadInfo = useTournamentInfoStore((s) => s.load);

  const matches = useMatchesStore((s) => s.matches);
  const loadMatches = useMatchesStore((s) => s.load);
  const matchesLoaded = useMatchesStore((s) => s.loaded);

  const players = usePlayersStore((s) => s.players);
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);

  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);

  useEffect(() => {
    if (!infoLoaded) void loadInfo();
  }, [infoLoaded, loadInfo]);

  useEffect(() => {
    if (!matchesLoaded) void loadMatches();
  }, [matchesLoaded, loadMatches]);

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  const periodStart = formatDate(info.periodStart);
  const periodEnd = formatDate(info.periodEnd);
  const period = periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : null;

  function team(id: string) {
    return teams.find((t) => t.id === id);
  }

  function teamName(id: string) {
    return team(id)?.name ?? '—';
  }

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.fullName ?? '—';
  }

  const nextMatch = useMemo(() => {
    return [...matches]
      .filter((m) => m.status !== 'finished')
      .sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt))[0];
  }, [matches]);

  const lastFinished = useMemo(() => {
    return [...matches]
      .filter((m) => m.status === 'finished')
      .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt))[0];
  }, [matches]);

  const featuredPhase = nextMatch?.phase ?? lastFinished?.phase ?? null;

  const featuredMatches = useMemo(() => {
    if (!featuredPhase) return [] as Match[];
    return matches
      .filter((m) => m.phase === featuredPhase)
      .sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt));
  }, [matches, featuredPhase]);

  const topGoleadores = useMemo(() => topScorers(matches).slice(0, 3), [matches]);

  const premios = [
    { icon: 'emoji_events', label: 'Campeón', amount: 'S/ 1,000', accent: 'primary' as const },
    { icon: 'military_tech', label: 'Subcampeón', amount: 'S/ 400', accent: 'neutral' as const },
    { icon: 'sports_soccer', label: 'Goleador del campeonato', amount: 'S/ 50', accent: 'tertiary' as const },
  ];

  const PREMIO_ACCENTS = {
    primary: { bg: 'bg-primary-container/12', border: 'border-primary-container/30', icon: 'text-primary-fixed-dim' },
    neutral: { bg: 'bg-surface-container-high', border: 'border-white/10', icon: 'text-on-surface-variant' },
    tertiary: { bg: 'bg-tertiary-container/12', border: 'border-tertiary-container/30', icon: 'text-tertiary-fixed-dim' },
  };

  return (
    <div className="space-y-6">
      {info.bannerUrl ? (
        <div className="panel-dark overflow-hidden p-0">
          <div className="flex flex-col items-start gap-4 border-b-4 border-primary-container bg-surface-container-lowest px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/logo.jpg" alt="Perros Locos" width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{info.name}</h2>
          </div>
          <div
            className="w-full bg-surface-container-lowest"
            style={{
              aspectRatio: '1640 / 664',
              backgroundImage: `url(${info.bannerUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        </div>
      ) : (
        <div className="panel-dark relative overflow-hidden p-8">
          <div
            className="pointer-events-none absolute -right-6 top-0 h-full w-48 bg-primary-container/20"
            style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0% 100%)' }}
          />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20">
              <Image src="/logo.jpg" alt="Perros Locos" width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{info.name}</h2>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {period && (
          <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface">
            <Icon name="calendar_month" className="text-primary-fixed-dim" /> {period}
          </span>
        )}
        <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface">
          <span className="h-2 w-2 rounded-full bg-primary-container" /> {TOURNAMENT_STATUS_LABELS[info.status]}
        </span>
        {info.organizer && (
          <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface">
            <Icon name="person" className="text-primary-fixed-dim" /> {info.organizer}
          </span>
        )}
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
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-surface-container-low p-4 text-center transition hover:border-primary-fixed-dim hover:shadow-sm"
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <TeamBadge name={team.name} color={team.color} size={48} />
                )}
                <p className="w-full truncate text-sm font-medium text-on-surface">{team.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-on-surface">
            Partidos{featuredPhase ? <span className="text-on-surface-variant"> · {featuredPhase}</span> : null}
          </h3>
          <Link href="/clasificacion" className="text-sm font-medium text-primary-fixed-dim hover:underline">
            Ver clasificación
          </Link>
        </div>
        {featuredMatches.length === 0 ? (
          <Card className="text-center text-sm text-on-surface-variant">
            No hay partidos cargados.{' '}
            <Link href="/clasificacion" className="font-medium text-primary-fixed-dim hover:underline">
              Cargar el primero
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {featuredMatches.map((m) => {
              const score = matchScore(m);
              const home = team(m.homeTeamId);
              const away = team(m.awayTeamId);
              const isNext = m.id === nextMatch?.id;
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-3 ${
                    isNext ? 'border-primary-container/40 bg-primary-container/10' : 'border-white/10 bg-surface-container-low'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-label text-[10px] uppercase text-on-surface-variant">
                      {m.scheduledAt ? formatDateTime(m.scheduledAt) : 'Sin horario'}
                    </span>
                    <MatchStatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      {home && <TeamBadge name={home.name} color={home.color} size={22} className="shrink-0" />}
                      <span className="truncate text-sm text-on-surface">{teamName(m.homeTeamId)}</span>
                    </div>
                    <span className="shrink-0 font-display text-base text-on-surface">
                      {score.home}-{score.away}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                      <span className="truncate text-right text-sm text-on-surface">{teamName(m.awayTeamId)}</span>
                      {away && <TeamBadge name={away.name} color={away.color} size={22} className="shrink-0" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl text-on-surface">Goleadores</h3>
            <Link href="/rankings" className="text-sm font-medium text-primary-fixed-dim hover:underline">
              Ver rankings
            </Link>
          </div>
          <Card className="flex flex-col gap-2">
            {topGoleadores.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Todavía no hay goles cargados.</p>
            ) : (
              topGoleadores.map((row, i) => (
                <div key={row.playerId} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2">
                  <span className="font-display text-lg text-primary-fixed-dim">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{playerName(row.playerId)}</p>
                    <p className="truncate text-xs text-on-surface-variant">{teamName(row.teamId)}</p>
                  </div>
                  <span className="shrink-0 font-display text-base text-on-surface">{row.count}</span>
                </div>
              ))
            )}
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl text-on-surface">Premios</h3>
          </div>
          <Card>
            <div className="grid grid-cols-3 gap-3">
              {premios.map((p) => {
                const accent = PREMIO_ACCENTS[p.accent];
                return (
                  <div key={p.label} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center ${accent.bg} ${accent.border}`}>
                    <Icon name={p.icon} className={`text-2xl ${accent.icon}`} />
                    <p className="text-xs leading-tight text-on-surface-variant">{p.label}</p>
                    <p className="font-label text-sm font-bold text-on-surface">{p.amount}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
