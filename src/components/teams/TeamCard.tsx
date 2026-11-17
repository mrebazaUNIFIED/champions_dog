'use client';

import { useState } from 'react';
import { FiCheck, FiAward, FiRepeat, FiTrendingDown, FiUsers } from 'react-icons/fi';
import { TeamBadge } from '../common/TeamBadge';
import { PositionBadge, SkillBadge } from '../common/Badges';
import type { Player, Team, TeamStats } from '../../types';

interface Props {
  team: Team;
  stats: TeamStats;
  benchPlayers: Player[];
  selected: { teamId: string; playerId: string } | null;
  onSelectForSwap: (playerId: string) => void;
  onReplace: (outPlayerId: string, benchPlayerId: string) => void;
  onRename: (name: string, color: string) => void;
  isStrongest: boolean;
  isWeakest: boolean;
}

export function TeamCard({
  team,
  stats,
  benchPlayers,
  selected,
  onSelectForSwap,
  onReplace,
  onRename,
  isStrongest,
  isWeakest,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);

  function commitEdit() {
    setEditingName(false);
    onRename(name.trim() || team.name, color);
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border bg-surface-0 shadow-sm transition-shadow"
      style={{
        borderColor: isStrongest ? `${color}70` : 'var(--color-surface-200)',
        boxShadow: isStrongest ? `0 0 0 1px ${color}30, 0 12px 24px -16px ${color}60` : undefined,
      }}
    >
      <div
        className="relative flex items-center justify-between gap-2 overflow-hidden border-b border-surface-200 px-5 py-4"
        style={{ background: `linear-gradient(135deg, ${team.color}14, transparent 80%)` }}
      >
        <div className="relative flex items-center gap-3">
          <TeamBadge name={team.name} color={team.color} size={42} />
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent"
              />
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') {
                    setName(team.name);
                    setColor(team.color);
                    setEditingName(false);
                  }
                }}
                className="w-28 rounded border border-surface-300 bg-surface-0 px-2 py-1 text-sm text-ink-900 outline-none"
              />
              <button
                type="button"
                onClick={commitEdit}
                className="rounded bg-ink-900 p-1.5 text-white hover:bg-ink-700"
                aria-label="Confirmar"
              >
                <FiCheck className="text-xs" />
              </button>
            </div>
          ) : (
            <button className="text-left" onClick={() => setEditingName(true)}>
              <p className="font-display text-base font-bold tracking-wide text-ink-900">{team.name}</p>
              <p className="text-[11px] text-ink-400">Click para renombrar</p>
            </button>
          )}
        </div>
        <div className="relative flex flex-col items-end gap-1">
          {isStrongest && (
            <span className="flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-bold text-white shadow">
              <FiAward className="text-gold-400" /> MÁS FUERTE
            </span>
          )}
          {isWeakest && (
            <span className="flex items-center gap-1 rounded-full border border-surface-300 bg-surface-0 px-2.5 py-1 text-[10px] font-semibold text-ink-500">
              <FiTrendingDown /> MÁS DÉBIL
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 px-3 py-3">
        {team.players.map((assigned) => {
          const isSelected = selected?.playerId === assigned.player.id;
          const eligibleBench = benchPlayers.filter(
            (b) => b.primaryPosition === assigned.assignedPosition || b.secondaryPositions.includes(assigned.assignedPosition),
          );
          return (
            <div
              key={assigned.player.id}
              className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition ${
                isSelected ? 'bg-green-50 ring-1 ring-green-300' : 'hover:bg-surface-50'
              }`}
            >
              <button
                onClick={() => onSelectForSwap(assigned.player.id)}
                className="flex flex-1 items-center gap-2 text-left"
                title="Seleccionar para intercambiar"
              >
                <FiRepeat className={`text-xs ${isSelected ? 'text-brand-600' : 'text-ink-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{assigned.player.fullName}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    <PositionBadge position={assigned.assignedPosition} />
                    <SkillBadge level={assigned.player.skillLevel} />
                  </div>
                </div>
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className="flex h-6 min-w-6 items-center justify-center rounded-full border border-surface-300 bg-surface-100 px-1.5 text-xs font-bold text-ink-900"
                  title="Puntaje"
                >
                  {assigned.score}
                </span>
                {eligibleBench.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) onReplace(assigned.player.id, e.target.value);
                      e.target.value = '';
                    }}
                    className="rounded border border-surface-300 bg-surface-0 px-1 py-0.5 text-[10px] text-ink-500"
                  >
                    <option value="" disabled>
                      Cambiar…
                    </option>
                    {eligibleBench.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-surface-200 bg-surface-50 px-4 py-3 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <FiUsers /> {team.players.length} jugadores
        </span>
        <span>
          Total: <span className="font-bold text-ink-900">{stats.totalScore}</span> · Prom:{' '}
          <span className="font-bold text-ink-900">{stats.averageScore.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
}
