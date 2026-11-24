'use client';

import { useMemo } from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TeamBadge } from '../common/TeamBadge';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useMatchesStore } from '../../store/useMatchesStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import { MATCH_STATUS_LABELS, matchScore, type MatchEvent, type MatchStatus, type TournamentTeam } from '../../types';

interface Props {
  matchId: string | null;
  onClose: () => void;
}

const STATUS_OPTIONS: MatchStatus[] = ['scheduled', 'live', 'finished'];

function eventLabel(event: MatchEvent, name: string): string {
  if (event.type === 'goal') return `¡Gol! — ${name}`;
  if (event.type === 'yellow') return `Tarjeta amarilla — ${name}`;
  return `Tarjeta roja — ${name}`;
}

export function MatchDetailModal({ matchId, onClose }: Props) {
  const matches = useMatchesStore((s) => s.matches);
  const updateMatch = useMatchesStore((s) => s.updateMatch);
  const addEvent = useMatchesStore((s) => s.addEvent);
  const removeEvent = useMatchesStore((s) => s.removeEvent);
  const teams = useTeamsStore((s) => s.teams);
  const players = usePlayersStore((s) => s.players);

  const match = matches.find((m) => m.id === matchId) ?? null;
  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  const feed = useMemo(() => {
    if (!match) return [];
    return [...match.events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [match]);

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.fullName ?? '—';
  }

  if (!match || !homeTeam || !awayTeam) return null;

  const score = matchScore(match);

  function renderRoster(team: TournamentTeam) {
    return (
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <TeamBadge name={team.name} color={team.color} size={28} />
          <p className="font-display text-lg text-on-surface">{team.name}</p>
        </div>
        <div className="space-y-1.5">
          {team.playerIds.map((playerId) => {
            const goals = match!.events.filter((e) => e.playerId === playerId && e.type === 'goal').length;
            const yellow = match!.events.filter((e) => e.playerId === playerId && e.type === 'yellow').length;
            const red = match!.events.filter((e) => e.playerId === playerId && e.type === 'red').length;
            return (
              <div
                key={playerId}
                className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-on-surface">{playerName(playerId)}</span>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-on-surface-variant">
                  {goals > 0 && <span>⚽ {goals}</span>}
                  {yellow > 0 && <span>🟨 {yellow}</span>}
                  {red > 0 && <span>🟥 {red}</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'goal')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container/15 text-primary-fixed-dim transition hover:bg-primary-container/25"
                    aria-label="Agregar gol"
                    title="Gol"
                  >
                    <Icon name="sports_soccer" />
                  </button>
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'yellow')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/20 transition hover:bg-yellow-400/30"
                    aria-label="Agregar amarilla"
                    title="Amarilla"
                  >
                    <span className="h-4 w-3 rounded-sm bg-yellow-400" />
                  </button>
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'red')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/15 transition hover:bg-secondary-container/25"
                    aria-label="Agregar roja"
                    title="Roja"
                  >
                    <span className="h-4 w-3 rounded-sm bg-secondary-container" />
                  </button>
                </div>
              </div>
            );
          })}
          {team.playerIds.length === 0 && <p className="text-xs text-on-surface-variant">Este equipo todavía no tiene plantel cargado.</p>}
        </div>
      </div>
    );
  }

  return (
    <Modal open={Boolean(matchId)} onClose={onClose} title="Detalle del partido" width="max-w-4xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => void updateMatch(match.id, { status })}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                match.status === status
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {MATCH_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex flex-1 items-center justify-end gap-2">
            <p className="truncate text-right font-display text-lg text-on-surface sm:text-xl">{homeTeam.name}</p>
            <TeamBadge name={homeTeam.name} color={homeTeam.color} size={36} className="shrink-0" />
          </div>
          <p className="shrink-0 font-display text-4xl text-on-surface">
            {score.home} — {score.away}
          </p>
          <div className="flex flex-1 items-center gap-2">
            <TeamBadge name={awayTeam.name} color={awayTeam.color} size={36} className="shrink-0" />
            <p className="truncate font-display text-lg text-on-surface sm:text-xl">{awayTeam.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {renderRoster(homeTeam)}
          {renderRoster(awayTeam)}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-on-surface">Jugadas del partido</p>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
            {feed.length === 0 && <p className="text-xs text-on-surface-variant">Todavía no hay jugadas.</p>}
            {feed.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-2 text-sm text-on-surface">
                <span>{eventLabel(event, playerName(event.playerId))}</span>
                <button
                  onClick={() => void removeEvent(match.id, event.id)}
                  className="text-on-surface-variant hover:text-red-500"
                  aria-label="Quitar jugada"
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
