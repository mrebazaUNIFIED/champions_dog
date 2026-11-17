'use client';

import { useEffect, useState } from 'react';
import { FiLoader, FiUser } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { uploadPlayerPhoto } from '../../lib/supabase/storage';
import {
  defaultPositionLevels,
  POSITIONS,
  POSITION_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
  type Player,
  type PlayerInput,
  type Position,
  type SkillLevel,
} from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: PlayerInput) => Promise<void>;
  initial?: Player | null;
}

const EMPTY: PlayerInput = {
  fullName: '',
  primaryPosition: 'defensa',
  secondaryPositions: [],
  positionLevels: defaultPositionLevels(3),
  available: true,
  notes: '',
  photoUrl: undefined,
};

export function PlayerFormModal({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<PlayerInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              fullName: initial.fullName,
              primaryPosition: initial.primaryPosition,
              secondaryPositions: initial.secondaryPositions,
              positionLevels: initial.positionLevels,
              available: initial.available,
              notes: initial.notes ?? '',
              photoUrl: initial.photoUrl,
            }
          : EMPTY,
      );
    }
  }, [open, initial]);

  function toggleSecondary(position: Position) {
    setForm((f) => ({
      ...f,
      secondaryPositions: f.secondaryPositions.includes(position)
        ? f.secondaryPositions.filter((p) => p !== position)
        : [...f.secondaryPositions, position],
    }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (isSupabaseConfigured) {
      setUploadingPhoto(true);
      try {
        const url = await uploadPlayerPhoto(file);
        setForm((f) => ({ ...f, photoUrl: url }));
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : 'No se pudo subir la foto.');
      } finally {
        setUploadingPhoto(false);
      }
      return;
    }

    // Sin Supabase configurado: se guarda como data URL en localStorage (solo para este navegador).
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, secondaryPositions: form.secondaryPositions.filter((p) => p !== form.primaryPosition) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar jugador' : 'Nuevo jugador'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-3xl text-ink-400">
            {uploadingPhoto ? (
              <FiLoader className="animate-spin text-xl text-brand-400" />
            ) : form.photoUrl ? (
              <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <FiUser />
            )}
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-ink-500">Fotografía (opcional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={uploadingPhoto}
              className="text-xs text-ink-500"
            />
            {photoError && <p className="mt-1 text-xs text-red-600">{photoError}</p>}
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-500">Nombre completo</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-500">Posición principal</label>
          <select
            value={form.primaryPosition}
            onChange={(e) => setForm((f) => ({ ...f, primaryPosition: e.target.value as Position }))}
            className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1 block text-sm text-ink-500">Nivel por posición</span>
          <p className="mb-2 text-xs text-ink-400">Qué tan bien juega en cada puesto, no solo en el suyo (1 Excelente a 6 Principiante).</p>
          <div className="grid grid-cols-2 gap-3">
            {POSITIONS.map((p) => (
              <div key={p}>
                <label className="mb-1 block text-xs text-ink-400">{POSITION_LABELS[p]}</label>
                <select
                  value={form.positionLevels[p]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      positionLevels: { ...f.positionLevels, [p]: Number(e.target.value) as SkillLevel },
                    }))
                  }
                  className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl} · {SKILL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm text-ink-500">Posiciones secundarias (opcional)</span>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.filter((p) => p !== form.primaryPosition).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => toggleSecondary(p)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  form.secondaryPositions.includes(p)
                    ? 'border-brand-500 bg-green-50 text-brand-600'
                    : 'border-surface-300 text-ink-500 hover:bg-surface-50'
                }`}
              >
                {POSITION_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            className="h-4 w-4 accent-brand-500"
          />
          Disponible para esta edición del campeonato
        </label>

        <div>
          <label className="mb-1 block text-sm text-ink-500">Observaciones (opcional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || uploadingPhoto}>
            {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Agregar jugador'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
