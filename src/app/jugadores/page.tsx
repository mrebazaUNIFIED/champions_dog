'use client';

import { useMemo, useRef, useState } from 'react';
import {
  FiDownload,
  FiGrid,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';
import { FiCheck } from 'react-icons/fi';
import { PositionBadge, PositionLevelsBadge, SkillBadge } from '../../components/common/Badges';
import { Button } from '../../components/common/Button';
import { Card, CardTitle } from '../../components/common/Card';
import { PlayerFormModal } from '../../components/players/PlayerFormModal';
import { downloadPlayersTemplate, exportPlayersToExcel, parsePlayersExcel } from '../../lib/export/excel';
import { usePlayersStore } from '../../store/usePlayersStore';
import {
  overallLevel,
  POSITIONS,
  POSITION_LABELS,
  SKILL_LEVELS,
  type Player,
  type Position,
  type SkillLevel,
} from '../../types';

const TARGET_GROUP_SIZE = 6;

/**
 * Reparte a todos los jugadores en 6 grupos parejos (lo más cerca posible de 6 cada uno),
 * ordenados de mejor a peor según el promedio de sus 4 niveles por posición. No es un
 * promedio redondeado por jugador (eso da grupos desparejos); es un ranking relativo al
 * resto del plantel, pensado para armar los 6 equipos con un jugador de cada nivel.
 */
function buildLevelTiers(players: Player[]): Player[][] {
  const ranked = [...players]
    .map((p) => ({
      player: p,
      score: POSITIONS.reduce((sum, pos) => sum + p.positionLevels[pos], 0) / POSITIONS.length,
    }))
    .sort((a, b) => a.score - b.score || a.player.fullName.localeCompare(b.player.fullName));

  const base = Math.floor(ranked.length / TARGET_GROUP_SIZE);
  const remainder = ranked.length % TARGET_GROUP_SIZE;
  const tiers: Player[][] = [];
  let cursor = 0;
  for (let i = 0; i < TARGET_GROUP_SIZE; i++) {
    const size = base + (i < remainder ? 1 : 0);
    tiers.push(ranked.slice(cursor, cursor + size).map((r) => r.player));
    cursor += size;
  }
  return tiers;
}

export default function JugadoresPage() {
  const players = usePlayersStore((s) => s.players);
  const addPlayer = usePlayersStore((s) => s.addPlayer);
  const updatePlayer = usePlayersStore((s) => s.updatePlayer);
  const deletePlayer = usePlayersStore((s) => s.deletePlayer);
  const importPlayers = usePlayersStore((s) => s.importPlayers);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<SkillLevel | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [importFeedback, setImportFeedback] = useState<{ added: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const levelTiers = useMemo(() => buildLevelTiers(players), [players]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      if (positionFilter !== 'all' && p.primaryPosition !== positionFilter && !p.secondaryPositions.includes(positionFilter))
        return false;
      if (levelFilter !== 'all' && overallLevel(p) !== levelFilter) return false;
      return true;
    });
  }, [players, search, positionFilter, levelFilter]);

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
          <h2 className="font-display text-2xl font-bold text-ink-900">Jugadores</h2>
          <p className="text-sm text-ink-500">{players.length} registrados · {players.filter((p) => p.available).length} disponibles</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadPlayersTemplate()}>
            <FiDownload /> Plantilla
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <FiUpload /> Importar Excel
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
          <Button variant="secondary" onClick={() => exportPlayersToExcel(players)}>
            <FiGrid /> Exportar
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <FiPlus /> Nuevo jugador
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="p-5 pb-0">
          <CardTitle>Resumen general de niveles</CardTitle>
          <p className="mt-1 text-sm text-ink-500">
            Los {players.length} jugadores se ordenan de mejor a peor (promedio de sus 4 niveles por posición) y se
            reparten en 6 grupos parejos, para armar los 6 equipos con un jugador de cada nivel.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Jugadores</th>
            </tr>
          </thead>
          <tbody>
            {SKILL_LEVELS.map((level, idx) => {
              const group = levelTiers[idx] ?? [];
              const isSix = group.length === TARGET_GROUP_SIZE;
              return (
                <tr key={level} className="border-b border-surface-200 last:border-0">
                  <td className="px-4 py-3">
                    <SkillBadge level={level} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isSix ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isSix && <FiCheck />} {group.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {group.length > 0 ? group.map((p) => p.fullName).join(', ') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {importFeedback && (
        <Card className="border-green-200">
          <p className="text-sm font-medium text-green-700">Se importaron {importFeedback.added} jugadores.</p>
          {importFeedback.errors.length > 0 && (
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
              {importFeedback.errors.map((err, i) => (
                <li key={i}>· {err}</li>
              ))}
            </ul>
          )}
          <button className="mt-2 text-xs text-ink-400 underline" onClick={() => setImportFeedback(null)}>
            Cerrar
          </button>
        </Card>
      )}

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-surface-300 bg-surface-0 py-2 pl-9 pr-3 text-sm text-ink-900 outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value as Position | 'all')}
          className="rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
        >
          <option value="all">Todas las posiciones</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {POSITION_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as SkillLevel))}
          className="rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
          title="Filtra por el nivel en la posición principal"
        >
          <option value="all">Todos los niveles</option>
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>
              Nivel {l}
            </option>
          ))}
        </select>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3">Posición principal</th>
              <th className="px-4 py-3">Secundarias</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-surface-200 last:border-0 hover:bg-surface-50">
                <td className="px-4 py-3 font-medium text-ink-900">{p.fullName}</td>
                <td className="px-4 py-3">
                  <PositionBadge position={p.primaryPosition} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.secondaryPositions.map((pos) => (
                      <PositionBadge key={pos} position={pos} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PositionLevelsBadge positionLevels={p.positionLevels} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {p.available ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-ink-500 hover:bg-surface-100 hover:text-ink-900"
                      aria-label="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${p.fullName}?`)) void deletePlayer(p.id);
                      }}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  No hay jugadores que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

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
