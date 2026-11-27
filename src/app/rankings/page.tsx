'use client';

import { useEffect } from 'react';
import { Card, CardTitle } from '../../components/common/Card';
import { TeamBadge } from '../../components/common/TeamBadge';
import { useMatchesStore } from '../../store/useMatchesStore';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import { cardTally, topScorers } from '../../types';

export default function RankingsPage() {
  const matches = useMatchesStore((s) => s.matches);
  const loadMatches = useMatchesStore((s) => s.load);
  const matchesLoaded = useMatchesStore((s) => s.loaded);

  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);

  const players = usePlayersStore((s) => s.players);
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);

  useEffect(() => {
    if (!matchesLoaded) void loadMatches();
  }, [matchesLoaded, loadMatches]);
  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);
  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  const scorers = topScorers(matches);
  const cards = cardTally(matches);

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.fullName ?? '—';
  }
  function team(id: string) {
    return teams.find((t) => t.id === id);
  }
  function teamName(id: string) {
    return team(id)?.name ?? '—';
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Rankings</h2>
        <p className="text-sm text-on-surface-variant">Goleadores, sanciones y premios del torneo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="p-5 pb-0">
            <CardTitle>Goleadores</CardTitle>
          </div>
          <div className="mt-3 divide-y divide-outline-variant">
            {scorers.length === 0 && <p className="px-5 py-6 text-sm text-on-surface-variant">Todavía no hay goles cargados.</p>}
            {scorers.map((s, i) => {
              const t = team(s.teamId);
              return (
                <div key={s.playerId} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 text-sm font-semibold text-on-surface-variant">{i + 1}</span>
                  {t?.logoUrl ? (
                    <img src={t.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  ) : t ? (
                    <TeamBadge name={t.name} color={t.color} size={32} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{playerName(s.playerId)}</p>
                    <p className="text-xs text-on-surface-variant">{teamName(s.teamId)}</p>
                  </div>
                  <p className="font-display text-xl text-on-surface">{s.count}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5 pb-0">
            <CardTitle>Sanciones</CardTitle>
          </div>
          <div className="mt-3 divide-y divide-outline-variant">
            {cards.length === 0 && <p className="px-5 py-6 text-sm text-on-surface-variant">Todavía no hay tarjetas cargadas.</p>}
            {cards.map((c) => {
              const t = team(c.teamId);
              return (
                <div key={c.playerId} className="flex items-center gap-3 px-5 py-3">
                  {t?.logoUrl ? (
                    <img src={t.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  ) : t ? (
                    <TeamBadge name={t.name} color={t.color} size={32} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{playerName(c.playerId)}</p>
                    <p className="text-xs text-on-surface-variant">{teamName(c.teamId)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-sm">
                    {c.yellow > 0 && (
                      <span className="rounded bg-surface-container-highest px-2 py-0.5 font-semibold text-on-surface-variant">🟨 {c.yellow}</span>
                    )}
                    {c.red > 0 && <span className="rounded bg-secondary-container/15 px-2 py-0.5 font-semibold text-secondary-container">🟥 {c.red}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
