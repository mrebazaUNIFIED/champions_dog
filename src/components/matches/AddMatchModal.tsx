'use client';

import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { MatchInput, TournamentTeam } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MatchInput) => Promise<void>;
  teams: TournamentTeam[];
  defaultPhase: string;
}

export function AddMatchModal({ open, onClose, onSubmit, teams, defaultPhase }: Props) {
  const [phase, setPhase] = useState(defaultPhase);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase(defaultPhase);
      setHomeTeamId(teams[0]?.id ?? '');
      setAwayTeamId(teams[1]?.id ?? '');
      setScheduledAt('');
      setError(null);
    }
  }, [open, defaultPhase, teams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (homeTeamId === awayTeamId) {
      setError('El local y el visitante tienen que ser equipos distintos.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        phase: phase.trim() || 'Fase 1',
        homeTeamId,
        awayTeamId,
        status: 'scheduled',
        homeLineup: [],
        awayLineup: [],
        scheduledAt: scheduledAt || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar partido">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Fase</label>
          <input
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            placeholder="Fase 1"
            className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Local</label>
            <select
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Visitante</label>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-on-surface-variant">Fecha y hora (opcional)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || teams.length < 2}>
            {saving ? 'Guardando…' : 'Agregar partido'}
          </Button>
        </div>
        {teams.length < 2 && <p className="text-xs text-on-surface-variant">Necesitás al menos 2 equipos cargados.</p>}
      </form>
    </Modal>
  );
}
