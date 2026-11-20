'use client';

import { useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
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

  function toggleLineup(side: 'home' | 'away', playerId: string) {
    if (!match) return;
    if (side === 'home') {
      const next = match.homeLineup.includes(playerId)
        ? match.homeLineup.filter((id) => id !== playerId)
        : [...match.homeLineup, playerId];
      void updateMatch(match.id, { homeLineup: next });
    } else {
      const next = match.awayLineup.includes(playerId)
        ? match.awayLineup.filter((id) => id !== playerId)
        : [...match.awayLineup, playerId];
      void updateMatch(match.id, { awayLineup: next });
    }
  }

  if (!match || !homeTeam || !awayTeam) return null;

  const score = matchScore(match);

  function renderRoster(team: TournamentTeam, side: 'home' | 'away') {
    const lineup = side === 'home' ? match!.homeLineup : match!.awayLineup;
    return (
      <div className="flex-1 space-y-2">
        <p className="font-display text-lg text-ink-900">{team.name}</p>
        <div className="space-y-1">
          {team.playerIds.map((playerId) => {
            const goals = match!.events.filter((e) => e.playerId === playerId && e.type === 'goal').length;
            const yellow = match!.events.filter((e) => e.playerId === playerId && e.type === 'yellow').length;
            const red = match!.events.filter((e) => e.playerId === playerId && e.type === 'red').length;
            return (
              <div key={playerId} className="flex items-center gap-2 rounded-lg border border-surface-200 px-2 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={lineup.includes(playerId)}
                  onChange={() => toggleLineup(side, playerId)}
                  className="h-4 w-4 shrink-0 accent-brand-500"
                  title="Titular"
                />
                <span className="min-w-0 flex-1 truncate text-ink-900">{playerName(playerId)}</span>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-ink-500">
                  {goals > 0 && <span>⚽ {goals}</span>}
                  {yellow > 0 && <span className="text-gray-600">🟨 {yellow}</span>}
                  {red > 0 && <span className="text-red-600">🟥 {red}</span>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'goal')}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                    title="Agregar gol"
                  >
                    +G
                  </button>
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'yellow')}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    title="Agregar amarilla"
                  >
                    +A
                  </button>
                  <button
                    onClick={() => void addEvent(match!.id, team.id, playerId, 'red')}
                    className="rounded px-1.5 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    title="Agregar roja"
                  >
                    +R
                  </button>
                </div>
              </div>
            );
          })}
          {team.playerIds.length === 0 && <p className="text-xs text-ink-400">Este equipo todavía no tiene plantel cargado.</p>}
        </div>
      </div>
    );
  }

  return (
    <Modal open={Boolean(matchId)} onClose={onClose} title="Detalle del partido" width="max-w-3xl">
      <div className="space-y-5">
        <div className="flex items-center justify-center gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => void updateMatch(match.id, { status })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                match.status === status ? 'bg-ink-900 text-white' : 'bg-surface-100 text-ink-500 hover:bg-surface-200'
              }`}
            >
              {MATCH_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          <p className="flex-1 text-right font-display text-xl text-ink-900">{homeTeam.name}</p>
          <p className="font-display text-4xl text-ink-900">
            {score.home} — {score.away}
          </p>
          <p className="flex-1 font-display text-xl text-ink-900">{awayTeam.name}</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {renderRoster(homeTeam, 'home')}
          {renderRoster(awayTeam, 'away')}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Jugadas del partido</p>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-surface-200 p-2">
            {feed.length === 0 && <p className="text-xs text-ink-400">Todavía no hay jugadas.</p>}
            {feed.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-2 text-sm text-ink-700">
                <span>{eventLabel(event, playerName(event.playerId))}</span>
                <button
                  onClick={() => void removeEvent(match.id, event.id)}
                  className="text-ink-300 hover:text-red-500"
                  aria-label="Quitar jugada"
                >
                  <FiX />
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
