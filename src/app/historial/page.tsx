'use client';

import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import { Card } from '../../components/common/Card';
import { TeamBadge } from '../../components/common/TeamBadge';
import { useHistoryStore } from '../../store/useHistoryStore';

export default function HistorialPage() {
  const { entries, loaded, load } = useHistoryStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Historial de selecciones</h2>
        <p className="text-sm text-ink-500">Consultá selecciones generadas anteriormente, sin sobrescribirlas.</p>
      </div>

      {entries.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-ink-400">
          <FiClock className="text-3xl" />
          Todavía no guardaste ninguna selección en el historial.
        </Card>
      )}

      <div className="space-y-3">
        {entries.map((entry) => {
          const isOpen = expanded === entry.id;
          return (
            <Card key={entry.id} className="p-0">
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div>
                  <p className="font-display font-semibold text-ink-900">
                    {entry.label || `Selección del ${new Date(entry.createdAt).toLocaleDateString('es-AR')}`}
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(entry.createdAt).toLocaleString('es-AR')} · {entry.playersSnapshot.length} jugadores ·
                    diferencia {entry.result.maxDiff} pts
                  </p>
                </div>
                {isOpen ? <FiChevronUp className="text-ink-500" /> : <FiChevronDown className="text-ink-500" />}
              </button>

              {isOpen && (
                <div className="grid gap-3 border-t border-surface-200 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {entry.result.teams.map((team) => {
                    const stats = entry.result.stats.find((s) => s.teamId === team.id);
                    return (
                      <div key={team.id} className="rounded-xl border border-surface-200 bg-surface-50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <TeamBadge name={team.name} color={team.color} size={28} />
                          <p className="font-medium text-ink-900">{team.name}</p>
                          <span className="ml-auto text-xs text-ink-500">
                            {stats?.totalScore} pts · prom {stats?.averageScore.toFixed(1)}
                          </span>
                        </div>
                        <ul className="space-y-1 text-xs text-ink-500">
                          {team.players.map((p) => (
                            <li key={p.player.id} className="flex justify-between">
                              <span>{p.player.fullName}</span>
                              <span className="text-ink-400">{p.assignedPosition} · N{p.player.skillLevel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
