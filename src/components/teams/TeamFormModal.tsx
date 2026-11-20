'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { uploadTeamLogo } from '../../lib/supabase/storage';
import { DEFAULT_TEAM_COLORS, type Player, type TournamentTeam } from '../../types';
import type { TeamInput } from '../../store/useTeamsStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: TeamInput) => Promise<void>;
  initial?: TournamentTeam | null;
  players: Player[];
}

const EMPTY: TeamInput = { name: '', color: DEFAULT_TEAM_COLORS[0], logoUrl: undefined, playerIds: [] };

export function TeamFormModal({ open, onClose, onSubmit, initial, players }: Props) {
  const [form, setForm] = useState<TeamInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, color: initial.color, logoUrl: initial.logoUrl, playerIds: initial.playerIds }
          : EMPTY,
      );
      setSearch('');
    }
  }, [open, initial]);

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.fullName.localeCompare(b.fullName)), [players]);
  const filteredPlayers = useMemo(
    () => sortedPlayers.filter((p) => p.fullName.toLowerCase().includes(search.toLowerCase())),
    [sortedPlayers, search],
  );

  function togglePlayer(id: string) {
    setForm((f) => ({
      ...f,
      playerIds: f.playerIds.includes(id) ? f.playerIds.filter((p) => p !== id) : [...f.playerIds, id],
    }));
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    if (isSupabaseConfigured) {
      setUploadingLogo(true);
      try {
        const url = await uploadTeamLogo(file);
        setForm((f) => ({ ...f, logoUrl: url }));
      } catch (err) {
        setLogoError(err instanceof Error ? err.message : 'No se pudo subir el logo.');
      } finally {
        setUploadingLogo(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar equipo' : 'Nuevo equipo'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-surface-container text-2xl text-on-surface-variant">
            {uploadingLogo ? (
              <Icon name="progress_activity" className="animate-spin text-xl text-primary-fixed-dim" />
            ) : form.logoUrl ? (
              <img src={form.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon name="shield" />
            )}
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-on-surface-variant">Logo (opcional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogo}
              disabled={uploadingLogo}
              className="text-xs text-on-surface-variant"
            />
            {logoError && <p className="mt-1 text-xs text-red-600">{logoError}</p>}
          </label>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Nombre del equipo</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Color</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="h-[42px] w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Plantel</span>
            <span className="text-xs text-on-surface-variant">{form.playerIds.length} seleccionados</span>
          </div>
          <div className="relative mb-2">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador…"
              className="w-full rounded-lg border border-white/15 bg-surface-container-low py-2 pl-9 pr-3 text-sm text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10">
            {filteredPlayers.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 border-b border-white/10 px-3 py-2 text-sm last:border-0 hover:bg-background"
              >
                <input
                  type="checkbox"
                  checked={form.playerIds.includes(p.id)}
                  onChange={() => togglePlayer(p.id)}
                  className="h-4 w-4 accent-primary-container"
                />
                {p.fullName}
              </label>
            ))}
            {filteredPlayers.length === 0 && <p className="px-3 py-4 text-center text-sm text-on-surface-variant">Sin resultados.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || uploadingLogo}>
            {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear equipo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
