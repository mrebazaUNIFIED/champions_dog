'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { MatchStatusBadge } from '../../components/common/Badges';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TeamBadge } from '../../components/common/TeamBadge';
import { AddMatchModal } from '../../components/matches/AddMatchModal';
import { MatchDetailModal } from '../../components/matches/MatchDetailModal';
import { useMatchesStore } from '../../store/useMatchesStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import { computeStandings, matchScore } from '../../types';

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

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);
  const phases = useMemo(() => [...new Set(matches.map((m) => m.phase))], [matches]);
  const filteredMatches = useMemo(
    () => matches.filter((m) => phaseFilter === 'all' || m.phase === phaseFilter),
    [matches, phaseFilter],
  );

  function team(id: string) {
    return teams.find((t) => t.id === id);
  }

  function teamName(id: string) {
    return team(id)?.name ?? '—';
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Clasificación</h2>
        <p className="text-sm text-ink-500">Tabla de posiciones y partidos del torneo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-x-auto p-0">
          {teams.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">Todavía no hay equipos cargados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-left text-xs uppercase tracking-wide text-ink-400">
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
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const t = team(row.teamId);
                  if (!t) return null;
                  return (
                    <tr key={row.teamId} className="border-b border-surface-200 last:border-0">
                      <td className="px-4 py-3 font-semibold text-ink-900">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <TeamBadge name={t.name} color={t.color} size={24} />
                          )}
                          <span className="font-medium text-ink-900">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-ink-900">{row.points}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.played}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.won}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.drawn}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.lost}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.goalsFor}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.goalsAgainst}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.goalDiff}</td>
                      <td className="px-3 py-3 text-center text-ink-500">{row.percentage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <div className="panel-dark flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-white">Partidos</p>
            {phases.length > 1 && (
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="rounded-lg border border-white/15 bg-pitch-800 px-2 py-1 text-xs text-white outline-none"
              >
                <option value="all">Todas las fases</option>
                {phases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            {filteredMatches.length === 0 && <p className="text-sm text-white/50">Todavía no hay partidos cargados.</p>}
            {filteredMatches.map((m) => {
              const score = matchScore(m);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className="w-full rounded-xl border border-white/10 bg-pitch-800/60 p-3 text-left transition hover:border-white/25"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] text-white/40">{m.phase}</span>
                    <MatchStatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-white">
                    <span className="min-w-0 flex-1 truncate">{teamName(m.homeTeamId)}</span>
                    <span className="shrink-0 px-2 font-display text-base">
                      {score.home} - {score.away}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right">{teamName(m.awayTeamId)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <Button onClick={() => setAddOpen(true)} disabled={teams.length < 2}>
            <FiPlus /> Agregar partido
          </Button>
        </div>
      </div>

      <AddMatchModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        teams={teams}
        defaultPhase={phases[phases.length - 1] ?? 'Fase 1'}
        onSubmit={async (input) => {
          await addMatch(input);
        }}
      />
      <MatchDetailModal matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
    </div>
  );
}
