'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../../components/common/Icon';
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
        <h2 className="font-display text-2xl font-bold text-on-surface">Historial de selecciones</h2>
        <p className="text-sm text-on-surface-variant">Consultá selecciones generadas anteriormente, sin sobrescribirlas.</p>
      </div>

      {entries.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-on-surface-variant">
          <Icon name="history" className="text-3xl" />
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
                  <p className="font-display font-semibold text-on-surface">
                    {entry.label || `Selección del ${new Date(entry.createdAt).toLocaleDateString('es-AR')}`}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(entry.createdAt).toLocaleString('es-AR')} · {entry.playersSnapshot.length} jugadores ·
                    diferencia {entry.result.maxDiff} pts
                  </p>
                </div>
                {isOpen ? <Icon name="expand_less" className="text-on-surface-variant" /> : <Icon name="expand_more" className="text-on-surface-variant" />}
              </button>

              {isOpen && (
                <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {entry.result.teams.map((team) => {
                    const stats = entry.result.stats.find((s) => s.teamId === team.id);
                    return (
                      <div key={team.id} className="rounded-xl border border-white/10 bg-background p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <TeamBadge name={team.name} color={team.color} size={28} />
                          <p className="font-medium text-on-surface">{team.name}</p>
                          <span className="ml-auto text-xs text-on-surface-variant">
                            {stats?.totalScore} pts · prom {stats?.averageScore.toFixed(1)}
                          </span>
                        </div>
                        <ul className="space-y-1 text-xs text-on-surface-variant">
                          {team.players.map((p) => (
                            <li key={p.player.id} className="flex justify-between">
                              <span>{p.player.fullName}</span>
                              <span className="text-on-surface-variant">{p.assignedPosition} · N{p.player.positionLevels[p.assignedPosition]}</span>
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
