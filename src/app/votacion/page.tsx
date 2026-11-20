'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useVotesStore } from '../../store/useVotesStore';
import {
  averageVoteForPosition,
  buildVoteMap,
  hasVotedAllPositions,
  POSITION_LABELS,
  POSITIONS,
  SKILL_LEVELS,
  VOTERS,
  type Position,
  type PositionVotes,
  type SkillLevel,
  type VoteMap,
  type VoterId,
} from '../../types';

const LAST_VOTER_KEY = 'pdl.lastVoter';

const POSITION_SHORT: Record<Position, string> = {
  arquero: 'Arq',
  defensa: 'Def',
  mediocampista: 'Med',
  delantero: 'Del',
};

const LEVEL_TEXT_COLORS: Record<SkillLevel, string> = {
  1: 'text-green-700',
  2: 'text-green-600',
  3: 'text-gray-600',
  4: 'text-gray-500',
  5: 'text-red-600',
  6: 'text-red-700',
};

function readLastVoter(): VoterId | null {
  try {
    const raw = localStorage.getItem(LAST_VOTER_KEY);
    return VOTERS.some((v) => v.id === raw) ? (raw as VoterId) : null;
  } catch {
    return null;
  }
}

function writeLastVoter(voterId: VoterId | null) {
  try {
    if (voterId) localStorage.setItem(LAST_VOTER_KEY, voterId);
    else localStorage.removeItem(LAST_VOTER_KEY);
  } catch {
    // modo privado u otro bloqueo de storage: no es crítico, simplemente no se recuerda.
  }
}

export default function VotacionPage() {
  const players = usePlayersStore((s) => s.players);
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);
  const applyPositionLevel = usePlayersStore((s) => s.applyPositionLevel);

  const votes = useVotesStore((s) => s.votes);
  const loadVotes = useVotesStore((s) => s.load);
  const votesLoaded = useVotesStore((s) => s.loaded);
  const setVote = useVotesStore((s) => s.setVote);

  const [voterId, setVoterId] = useState<VoterId | null>(null);
  const [index, setIndex] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [draft, setDraft] = useState<PositionVotes>({});

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  useEffect(() => {
    if (!votesLoaded) void loadVotes();
  }, [votesLoaded, loadVotes]);

  useEffect(() => {
    setVoterId(readLastVoter());
  }, []);

  const votesByPlayer = useMemo(() => {
    const byPlayer = new Map<string, typeof votes>();
    for (const record of votes) {
      const list = byPlayer.get(record.playerId) ?? [];
      list.push(record);
      byPlayer.set(record.playerId, list);
    }
    const map = new Map<string, VoteMap>();
    for (const [playerId, records] of byPlayer) map.set(playerId, buildVoteMap(records));
    return map;
  }, [votes]);

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.fullName.localeCompare(b.fullName)), [players]);

  const fullyVotedCount = sortedPlayers.filter((p) => {
    const v = votesByPlayer.get(p.id) ?? {};
    return VOTERS.every((voter) => hasVotedAllPositions(v[voter.id]));
  }).length;

  const votedByMeCount = voterId
    ? sortedPlayers.filter((p) => hasVotedAllPositions((votesByPlayer.get(p.id) ?? {})[voterId])).length
    : 0;

  useEffect(() => {
    if (!voterId) return;
    const player = sortedPlayers[index];
    if (!player) return;
    setDraft({ ...(votesByPlayer.get(player.id)?.[voterId] ?? {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, voterId]);

  async function castVote(playerId: string, voter: VoterId, position: Position, level: SkillLevel) {
    const player = sortedPlayers.find((p) => p.id === playerId);
    if (!player) return;
    const existingVoterVotes = votesByPlayer.get(playerId)?.[voter] ?? {};
    const updatedVoterVotes = { ...existingVoterVotes, [position]: level };
    const updatedVotesForPlayer = { ...votesByPlayer.get(playerId), [voter]: updatedVoterVotes };

    await setVote(playerId, voter, position, level);
    const proposed = averageVoteForPosition(updatedVotesForPlayer, position);
    if (proposed && proposed !== player.positionLevels[position]) {
      await applyPositionLevel(playerId, position, proposed);
    }
  }

  function pickVoter(id: VoterId) {
    writeLastVoter(id);
    setVoterId(id);
    const firstPending = sortedPlayers.findIndex((p) => !hasVotedAllPositions((votesByPlayer.get(p.id) ?? {})[id]));
    setIndex(firstPending === -1 ? 0 : firstPending);
  }

  function changeVoter() {
    writeLastVoter(null);
    setVoterId(null);
    setIndex(0);
  }

  function vote(position: Position, level: SkillLevel) {
    if (!voterId) return;
    const player = sortedPlayers[index];
    if (!player) return;
    setDraft((d) => ({ ...d, [position]: level }));
    void castVote(player.id, voterId, position, level);
  }

  if (!playersLoaded || !votesLoaded) {
    return <p className="text-sm text-on-surface-variant">Cargando…</p>;
  }

  if (sortedPlayers.length === 0) {
    return (
      <Card>
        <p className="text-sm text-on-surface-variant">No hay jugadores registrados todavía. Agregalos primero en &quot;Jugadores&quot;.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Votación de niveles</h2>
        <p className="text-sm text-on-surface-variant">
          Cada votante elige su nombre y califica a cada jugador en las 4 posiciones (1 Excelente a 6 Principiante), no
          solo en la suya. El nivel oficial de cada jugador en cada posición se actualiza solo, con el promedio de los
          votos recibidos hasta el momento.
        </p>
      </div>

      {!voterId ? (
        <Card>
          <p className="mb-4 text-sm font-medium text-on-surface">¿Quién sos?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VOTERS.map((voter) => {
              const count = sortedPlayers.filter((p) => hasVotedAllPositions((votesByPlayer.get(p.id) ?? {})[voter.id])).length;
              return (
                <button
                  key={voter.id}
                  onClick={() => pickVoter(voter.id)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/15 bg-surface-container-low px-3 py-4 text-center transition hover:border-primary-container hover:bg-primary-container/5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-lg text-primary-fixed-dim">
                    <Icon name="person" />
                  </span>
                  <span className="font-display text-sm font-semibold text-on-surface">{voter.name}</span>
                  <span className="text-xs text-on-surface-variant">{count}/{sortedPlayers.length} votados</span>
                </button>
              );
            })}
          </div>
        </Card>
      ) : index >= sortedPlayers.length ? (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600">
            <Icon name="check_circle" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-on-surface">¡Listo, {VOTERS.find((v) => v.id === voterId)?.name}!</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Votaste {votedByMeCount} de {sortedPlayers.length} jugadores.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => setIndex(0)}>
              <Icon name="keyboard_double_arrow_left" /> Revisar mis votos
            </Button>
            <Button onClick={changeVoter}>
              <Icon name="logout" /> Cambiar de votante
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-5 py-8 text-center">
          <div className="flex w-full items-center justify-between text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 font-medium text-on-surface">
              <Icon name="person" /> {VOTERS.find((v) => v.id === voterId)?.name}
            </span>
            <button onClick={changeVoter} className="underline hover:text-on-surface">
              Cambiar votante
            </button>
          </div>

          <div className="w-full">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary-container transition-all"
                style={{ width: `${(index / sortedPlayers.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">
              Jugador {index + 1} de {sortedPlayers.length} · {votedByMeCount} votados
            </p>
          </div>

          <p className="font-display text-2xl font-bold text-on-surface">{sortedPlayers[index].fullName}</p>
          <p className="-mt-3 text-[11px] text-on-surface-variant">1 Excelente · 2 Muy bueno · 3 Bueno · 4 Regular · 5 Flojo · 6 Principiante</p>

          <div className="w-full space-y-3">
            {POSITIONS.map((position) => (
              <div key={position}>
                <p className="mb-1 text-left text-xs font-medium text-on-surface-variant">{POSITION_LABELS[position]}</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {SKILL_LEVELS.map((level) => {
                    const active = draft[position] === level;
                    return (
                      <button
                        key={level}
                        onClick={() => vote(position, level)}
                        className={`rounded-lg border py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-primary-container bg-primary-container text-white shadow-sm shadow-brand-500/30'
                            : 'border-white/15 bg-surface-container-low text-on-surface hover:border-primary-fixed-dim'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex w-full items-center justify-between pt-2">
            <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              <Icon name="chevron_left" /> Anterior
            </Button>
            <Button onClick={() => setIndex((i) => Math.min(sortedPlayers.length, i + 1))}>
              Siguiente <Icon name="chevron_right" />
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface">
            <Icon name="group" className="text-primary-fixed-dim" />
            {fullyVotedCount} de {sortedPlayers.length} jugadores con los 8 votos completos
          </div>
          <Button variant="secondary" onClick={() => setShowTable((s) => !s)}>
            {showTable ? <Icon name="visibility_off" /> : <Icon name="visibility" />} {showTable ? 'Ocultar resumen' : 'Ver resumen de todos'}
          </Button>
        </div>

        {showTable && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-24 sm:w-40" />
                {POSITIONS.map((position) => (
                  <col key={position} className="w-14" />
                ))}
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-on-surface-variant">
                  <th className="sticky left-0 z-10 bg-surface-container-low px-3 py-3">Jugador</th>
                  {POSITIONS.map((position) => (
                    <th key={position} className="px-1 py-3 text-center font-medium" title={POSITION_LABELS[position]}>
                      {POSITION_SHORT[position]}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center">Votos</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => {
                  const playerVotes = votesByPlayer.get(player.id) ?? {};
                  const completedVoters = VOTERS.filter((voter) => hasVotedAllPositions(playerVotes[voter.id])).length;
                  return (
                    <tr key={player.id} className="border-b border-white/10 last:border-0 hover:bg-background">
                      <td className="sticky left-0 z-10 bg-surface-container-low px-3 py-2 font-medium text-on-surface">{player.fullName}</td>
                      {POSITIONS.map((position) => (
                        <td key={position} className="px-1 py-2 text-center">
                          <span className={`text-xs font-semibold ${LEVEL_TEXT_COLORS[player.positionLevels[position]]}`}>
                            {player.positionLevels[position]}
                          </span>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center text-xs text-on-surface-variant">{completedVoters}/8</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
