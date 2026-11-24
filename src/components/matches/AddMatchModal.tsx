'use client';

import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { KNOCKOUT_ROUND_PRESETS, type MatchInput, type MatchStage, type TournamentTeam } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MatchInput) => Promise<void>;
  teams: TournamentTeam[];
  nextFechaNumber: number;
}

export function AddMatchModal({ open, onClose, onSubmit, teams, nextFechaNumber }: Props) {
  const [stage, setStage] = useState<MatchStage>('fecha');
  const [fechaNumber, setFechaNumber] = useState(nextFechaNumber);
  const [round, setRound] = useState(KNOCKOUT_ROUND_PRESETS[0]);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStage('fecha');
      setFechaNumber(nextFechaNumber);
      setRound(KNOCKOUT_ROUND_PRESETS[0]);
      setHomeTeamId(teams[0]?.id ?? '');
      setAwayTeamId(teams[1]?.id ?? '');
      setScheduledAt('');
      setError(null);
    }
  }, [open, nextFechaNumber, teams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (homeTeamId === awayTeamId) {
      setError('El local y el visitante tienen que ser equipos distintos.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        stage,
        phase: stage === 'fecha' ? `Fecha ${fechaNumber}` : round.trim() || KNOCKOUT_ROUND_PRESETS[0],
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
          <label className="mb-1 block text-sm text-on-surface-variant">Etapa</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStage('fecha')}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                stage === 'fecha'
                  ? 'border-primary-container bg-primary-container/15 text-primary-fixed-dim'
                  : 'border-white/15 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              Fecha de liga
            </button>
            <button
              type="button"
              onClick={() => setStage('eliminatoria')}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                stage === 'eliminatoria'
                  ? 'border-secondary-container bg-secondary-container/15 text-secondary-fixed'
                  : 'border-white/15 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              Eliminatoria
            </button>
          </div>
        </div>

        {stage === 'fecha' ? (
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">N.º de fecha</label>
            <input
              type="number"
              min={1}
              value={fechaNumber}
              onChange={(e) => setFechaNumber(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
            <p className="mt-1 text-xs text-on-surface-variant">Suma a la tabla de posiciones.</p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Ronda</label>
            <select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            >
              {KNOCKOUT_ROUND_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-on-surface-variant">No suma a la tabla de posiciones.</p>
          </div>
        )}

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
