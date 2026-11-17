'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiSave } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card, CardTitle } from '../../components/common/Card';
import { checkFeasibility, computeSlots } from '../../lib/algorithms/teamValidation';
import { useConfigStore } from '../../store/useConfigStore';
import { usePlayersStore } from '../../store/usePlayersStore';
import { POSITIONS, POSITION_LABELS, type Formation } from '../../types';

export default function CampeonatoConfigPage() {
  const config = useConfigStore((s) => s.config);
  const save = useConfigStore((s) => s.save);
  const players = usePlayersStore((s) => s.players);

  const [formation, setFormation] = useState<Formation>(config.formation);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormation(config.formation);
  }, [config.formation]);

  const slots = computeSlots(formation, config.numberOfTeams);
  const playersPerTeam = Object.values(formation).reduce((a, b) => a + b, 0);
  const totalNeeded = playersPerTeam * config.numberOfTeams;
  const feasibility = checkFeasibility(players, formation, config.numberOfTeams);

  async function handleSave() {
    await save({ ...config, formation });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Configuración del campeonato</h2>
        <p className="text-sm text-ink-500">
          El campeonato siempre arma {config.numberOfTeams} equipos. Definí cuántos jugadores de cada posición
          lleva cada equipo.
        </p>
      </div>

      <Card>
        <CardTitle>Formación obligatoria por equipo</CardTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POSITIONS.map((position) => (
            <div key={position}>
              <label className="mb-1 block text-sm text-ink-500">{POSITION_LABELS[position]}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={formation[position]}
                onChange={(e) =>
                  setFormation((f) => ({ ...f, [position]: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-ink-400">
                {formation[position] * config.numberOfTeams} jugadores necesarios en total
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4">
          <div className="text-sm text-ink-700">
            <p>
              <span className="font-semibold text-ink-900">{playersPerTeam}</span> jugadores por equipo ×{' '}
              <span className="font-semibold text-ink-900">{config.numberOfTeams}</span> equipos ={' '}
              <span className="font-semibold text-brand-600">{totalNeeded}</span> jugadores necesarios
            </p>
          </div>
          <Button onClick={handleSave}>
            {saved ? <FiCheckCircle /> : <FiSave />} {saved ? 'Guardado' : 'Guardar configuración'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Validación con los jugadores actuales</CardTitle>
        <div className="mt-3 flex items-start gap-3">
          {feasibility.ok ? (
            <FiCheckCircle className="mt-1 text-brand-600" />
          ) : (
            <FiAlertTriangle className="mt-1 text-amber-600" />
          )}
          <div className="text-sm text-ink-700">
            {feasibility.ok ? (
              <p>Hay suficientes jugadores disponibles para esta formación.</p>
            ) : (
              <>
                <p className="text-amber-700">{feasibility.message}</p>
                {feasibility.shortages.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {feasibility.shortages.map((s) => (
                      <li key={s.position}>
                        · {POSITION_LABELS[s.position]}: hay {s.eligibleAvailable}, se necesitan {s.needed}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-500 sm:grid-cols-4">
          {POSITIONS.map((p) => (
            <div key={p} className="rounded-lg border border-surface-200 px-3 py-2">
              {POSITION_LABELS[p]}: <span className="text-ink-900">{slots[p]}</span> plazas
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
