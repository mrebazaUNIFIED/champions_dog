'use client';

import { useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { PositionBadge } from '../../components/common/Badges';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PlayerFormModal } from '../../components/players/PlayerFormModal';
import { downloadPlayersTemplate, exportPlayersToExcel, parsePlayersExcel } from '../../lib/export/excel';
import { usePlayersStore } from '../../store/usePlayersStore';
import { POSITIONS, POSITION_LABELS, SKILL_LEVELS, type Player, type Position, type SkillLevel } from '../../types';

/** Agrupa a los jugadores por su nivel real (asignado a mano). */
function groupByLevel(players: Player[]): Map<SkillLevel, Player[]> {
  const groups = new Map<SkillLevel, Player[]>();
  for (const level of SKILL_LEVELS) groups.set(level, []);
  for (const p of [...players].sort((a, b) => a.fullName.localeCompare(b.fullName))) {
    groups.get(p.level)?.push(p);
  }
  return groups;
}

export default function JugadoresPage() {
  const players = usePlayersStore((s) => s.players);
  const addPlayer = usePlayersStore((s) => s.addPlayer);
  const updatePlayer = usePlayersStore((s) => s.updatePlayer);
  const deletePlayer = usePlayersStore((s) => s.deletePlayer);
  const importPlayers = usePlayersStore((s) => s.importPlayers);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [importFeedback, setImportFeedback] = useState<{ added: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const groupedByLevel = useMemo(() => groupByLevel(players), [players]);

  function matchesFilters(p: Player) {
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    if (positionFilter !== 'all' && p.primaryPosition !== positionFilter && !p.secondaryPositions.includes(positionFilter))
      return false;
    return true;
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const { players: parsed, errors } = await parsePlayersExcel(file);
    if (parsed.length > 0) await importPlayers(parsed);
    setImportFeedback({ added: parsed.length, errors });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Jugadores</h2>
          <p className="text-sm text-on-surface-variant">{players.length} registrados · {players.filter((p) => p.available).length} disponibles</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadPlayersTemplate()}>
            <Icon name="download" /> Plantilla
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" /> Importar Excel
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
          <Button variant="secondary" onClick={() => exportPlayersToExcel(players)}>
            <Icon name="grid_view" /> Exportar
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Icon name="add" /> Nuevo jugador
          </Button>
        </div>
      </div>

      {importFeedback && (
        <Card className="border-primary-container/30">
          <p className="text-sm font-medium text-primary-fixed-dim">Se importaron {importFeedback.added} jugadores.</p>
          {importFeedback.errors.length > 0 && (
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-secondary-container">
              {importFeedback.errors.map((err, i) => (
                <li key={i}>· {err}</li>
              ))}
            </ul>
          )}
          <button className="mt-2 text-xs text-on-surface-variant underline" onClick={() => setImportFeedback(null)}>
            Cerrar
          </button>
        </Card>
      )}

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-sm text-on-surface outline-none focus:border-primary-container"
          />
        </div>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value as Position | 'all')}
          className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container"
        >
          <option value="all">Todas las posiciones</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {POSITION_LABELS[p]}
            </option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {SKILL_LEVELS.map((level) => {
          const tierPlayers = (groupedByLevel.get(level) ?? []).filter(matchesFilters);
          if (tierPlayers.length === 0) return null;
          return (
            <div key={level} className="flex flex-col gap-3">
              <div className="flex flex-col">
                <p className="font-display text-lg font-bold uppercase tracking-wide text-on-surface">Nivel {level}</p>
                <p className="text-xs text-on-surface-variant">{tierPlayers.length} jugadores</p>
              </div>
              <div className="flex flex-col gap-2">
                {tierPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="group relative flex flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-center"
                  >
                    <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="rounded p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        aria-label="Editar"
                      >
                        <Icon name="edit" className="text-xs" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${p.fullName}?`)) void deletePlayer(p.id);
                        }}
                        className="rounded p-1 text-secondary-container hover:bg-secondary-container/10"
                        aria-label="Eliminar"
                      >
                        <Icon name="delete" className="text-xs" />
                      </button>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container text-on-surface-variant">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Icon name="person" />
                      )}
                    </div>
                    <p className="w-full truncate text-sm font-medium text-on-surface">{p.fullName}</p>
                    <PositionBadge position={p.primaryPosition} />
                    {!p.available && (
                      <span className="rounded-full bg-secondary-container/10 px-2 py-0.5 text-[10px] font-medium text-secondary-container">
                        No disponible
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {players.length > 0 && SKILL_LEVELS.every((level) => (groupedByLevel.get(level) ?? []).filter(matchesFilters).length === 0) && (
          <Card className="col-span-full py-10 text-center text-sm text-on-surface-variant">No hay jugadores que coincidan con el filtro.</Card>
        )}
        {players.length === 0 && (
          <Card className="col-span-full py-10 text-center text-sm text-on-surface-variant">Todavía no hay jugadores registrados.</Card>
        )}
      </div>

      <PlayerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) await updatePlayer(editing.id, input);
          else await addPlayer(input);
        }}
      />
    </div>
  );
}
