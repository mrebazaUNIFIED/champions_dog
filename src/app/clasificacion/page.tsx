'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { MatchStatusBadge } from '../../components/common/Badges';
import { Card } from '../../components/common/Card';
import { TeamBadge } from '../../components/common/TeamBadge';
import { AddMatchModal } from '../../components/matches/AddMatchModal';
import { MatchDetailModal } from '../../components/matches/MatchDetailModal';
import { useMatchesStore } from '../../store/useMatchesStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import { computeStandings, matchScore, type Match } from '../../types';

const RESULT_COLORS: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-primary-container text-on-primary-container',
  D: 'bg-surface-container-highest text-on-surface-variant',
  L: 'bg-secondary-container text-white',
};

function formatMatchDateTime(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  const weekday = d.toLocaleDateString('es-AR', { weekday: 'short' });
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${weekday}, ${date} · ${time}`;
}

/** Resultado (V/E/D) de los últimos 5 partidos finalizados de un equipo, del más viejo al más nuevo. */
function lastResults(teamId: string, matches: Match[]): Array<'W' | 'D' | 'L'> {
  const finished = matches
    .filter((m) => m.status === 'finished' && (m.homeTeamId === teamId || m.awayTeamId === teamId))
    .sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt))
    .slice(-5);

  return finished.map((m) => {
    const { home, away } = matchScore(m);
    const isHome = m.homeTeamId === teamId;
    const own = isHome ? home : away;
    const opponent = isHome ? away : home;
    if (own > opponent) return 'W';
    if (own < opponent) return 'L';
    return 'D';
  });
}

export default function ClasificacionPage() {
  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);

  const matches = useMatchesStore((s) => s.matches);
  const loadMatches = useMatchesStore((s) => s.load);
  const matchesLoaded = useMatchesStore((s) => s.loaded);
  const addMatch = useMatchesStore((s) => s.addMatch);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState('all');

  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);

  useEffect(() => {
    if (!matchesLoaded) void loadMatches();
  }, [matchesLoaded, loadMatches]);

  // Al cargar, si existe "Fecha 1" la dejamos seleccionada por defecto en vez de "Todas las fases".
  useEffect(() => {
    if (matchesLoaded && matches.some((m) => m.phase === 'Fecha 1')) {
      setPhaseFilter((current) => (current === 'all' ? 'Fecha 1' : current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesLoaded]);

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);
  const phases = useMemo(() => [...new Set(matches.map((m) => m.phase))], [matches]);
  const filteredMatches = useMemo(
    () => matches.filter((m) => phaseFilter === 'all' || m.phase === phaseFilter),
    [matches, phaseFilter],
  );
  const matchStats = useMemo(() => {
    const finished = filteredMatches.filter((m) => m.status === 'finished');
    const draws = finished.filter((m) => {
      const s = matchScore(m);
      return s.home === s.away;
    }).length;
    const goals = finished.reduce((sum, m) => {
      const s = matchScore(m);
      return sum + s.home + s.away;
    }, 0);
    return { played: finished.length, draws, goals, avg: finished.length > 0 ? goals / finished.length : 0 };
  }, [filteredMatches]);
  const nextFechaNumber = useMemo(() => {
    const numbers = matches
      .filter((m) => m.stage === 'fecha')
      .map((m) => Number(/^Fecha (\d+)$/.exec(m.phase)?.[1]))
      .filter((n) => Number.isFinite(n));
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  }, [matches]);

  function team(id: string) {
    return teams.find((t) => t.id === id);
  }

  function teamName(id: string) {
    return team(id)?.name ?? '—';
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación</h2>
        <p className="text-sm text-on-surface-variant">Tabla de posiciones y partidos del torneo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-x-auto p-0">
          {teams.length === 0 ? (
            <p className="p-6 text-center text-sm text-on-surface-variant">Todavía no hay equipos cargados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3">Pos</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-3 py-3 text-center">PTS</th>
                  <th className="px-3 py-3 text-center">J</th>
                  <th className="px-3 py-3 text-center">G</th>
                  <th className="px-3 py-3 text-center">E</th>
                  <th className="px-3 py-3 text-center">P</th>
                  <th className="px-3 py-3 text-center">GF</th>
                  <th className="px-3 py-3 text-center">GC</th>
                  <th className="px-3 py-3 text-center">DIF</th>
                  <th className="px-3 py-3 text-center">%</th>
                  <th className="px-3 py-3 text-center">Últimos 5</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const t = team(row.teamId);
                  if (!t) return null;
                  return (
                    <tr key={row.teamId} className="border-b border-outline-variant last:border-0">
                      <td className="px-4 py-3 font-semibold text-on-surface">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <TeamBadge name={t.name} color={t.color} size={24} />
                          )}
                          <span className="font-medium text-on-surface">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-on-surface">{row.points}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.played}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.won}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.drawn}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.lost}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.goalsFor}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.goalsAgainst}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.goalDiff}</td>
                      <td className="px-3 py-3 text-center text-on-surface-variant">{row.percentage}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1">
                          {lastResults(row.teamId, matches).map((result, idx) => (
                            <span
                              key={idx}
                              className={`flex h-5 w-5 items-center justify-center rounded font-label text-[9px] ${RESULT_COLORS[result]}`}
                            >
                              {result}
                            </span>
                          ))}
                          {lastResults(row.teamId, matches).length === 0 && (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between gap-3 bg-on-primary-container px-4 py-4">
            <p className="font-display text-lg text-white">Partidos</p>
            {phases.length > 1 && (
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="rounded-full border border-white/30 bg-transparent px-3 py-1 text-xs text-white outline-none"
              >
                <option value="all" className="text-on-surface">
                  Todas las fases
                </option>
                {phases.map((p) => (
                  <option key={p} value={p} className="text-on-surface">
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4">
            {filteredMatches.length > 0 && (
              <div className="grid grid-cols-4 divide-x divide-outline-variant overflow-hidden rounded-lg border border-outline-variant">
                {[
                  { label: 'Juegos', value: matchStats.played },
                  { label: 'Empates', value: matchStats.draws },
                  { label: 'Goles', value: matchStats.goals },
                  { label: 'Promedio', value: matchStats.avg.toFixed(1) },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-0.5 py-2 text-center">
                    <span className="font-display text-xl text-on-surface">{stat.value}</span>
                    <span className="font-label text-[9px] uppercase text-on-surface-variant">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {filteredMatches.length === 0 && <p className="text-sm text-on-surface-variant">Todavía no hay partidos cargados.</p>}
              {filteredMatches.map((m) => {
                const score = matchScore(m);
                const home = team(m.homeTeamId);
                const away = team(m.awayTeamId);
                const when = formatMatchDateTime(m.scheduledAt);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-left transition hover:border-primary-container/40"
                  >
                    <div className="mb-2 flex items-center justify-center gap-1.5">
                      {m.stage === 'eliminatoria' && (
                        <span className="rounded bg-secondary-container/20 px-1 py-0.5 font-label text-[9px] text-secondary-fixed">
                          ELIM
                        </span>
                      )}
                      <MatchStatusBadge status={m.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                        {home ? (
                          <TeamBadge name={home.name} color={home.color} size={32} />
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                        <span className="w-full truncate text-xs font-medium text-on-surface">{teamName(m.homeTeamId)}</span>
                      </div>
                      <span className="shrink-0 px-1 font-display text-2xl text-on-surface">
                        {score.home} : {score.away}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                        {away ? (
                          <TeamBadge name={away.name} color={away.color} size={32} />
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                        <span className="w-full truncate text-xs font-medium text-on-surface">{teamName(m.awayTeamId)}</span>
                      </div>
                    </div>
                    {when && <p className="mt-2 text-center text-[11px] text-on-surface-variant">{when}</p>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setAddOpen(true)}
              disabled={teams.length < 2}
              className="flex items-center justify-center gap-2 rounded-full bg-on-primary-container px-4 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-on-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="add" /> Agregar partido
            </button>
          </div>
        </div>
      </div>

      <AddMatchModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        teams={teams}
        nextFechaNumber={nextFechaNumber}
        onSubmit={async (input) => {
          await addMatch(input);
        }}
      />
      <MatchDetailModal matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
    </div>
  );
}
