'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../../components/common/Icon';
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
        <h2 className="font-display text-2xl font-bold text-on-surface">Configuración del campeonato</h2>
        <p className="text-sm text-on-surface-variant">
          El campeonato siempre arma {config.numberOfTeams} equipos. Definí cuántos jugadores de cada posición
          lleva cada equipo.
        </p>
      </div>

      <Card>
        <CardTitle>Formación obligatoria por equipo</CardTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POSITIONS.map((position) => (
            <div key={position}>
              <label className="mb-1 block text-sm text-on-surface-variant">{POSITION_LABELS[position]}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={formation[position]}
                onChange={(e) =>
                  setFormation((f) => ({ ...f, [position]: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="w-full rounded-lg border border-white/15 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                {formation[position] * config.numberOfTeams} jugadores necesarios en total
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-background p-4">
          <div className="text-sm text-on-surface">
            <p>
              <span className="font-semibold text-on-surface">{playersPerTeam}</span> jugadores por equipo ×{' '}
              <span className="font-semibold text-on-surface">{config.numberOfTeams}</span> equipos ={' '}
              <span className="font-semibold text-primary-fixed-dim">{totalNeeded}</span> jugadores necesarios
            </p>
          </div>
          <Button onClick={handleSave}>
            {saved ? <Icon name="check_circle" /> : <Icon name="save" />} {saved ? 'Guardado' : 'Guardar configuración'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Validación con los jugadores actuales</CardTitle>
        <div className="mt-3 flex items-start gap-3">
          {feasibility.ok ? (
            <Icon name="check_circle" className="mt-1 text-primary-fixed-dim" />
          ) : (
            <Icon name="warning" className="mt-1 text-gray-600" />
          )}
          <div className="text-sm text-on-surface">
            {feasibility.ok ? (
              <p>Hay suficientes jugadores disponibles para esta formación.</p>
            ) : (
              <>
                <p className="text-gray-700">{feasibility.message}</p>
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
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-on-surface-variant sm:grid-cols-4">
          {POSITIONS.map((p) => (
            <div key={p} className="rounded-lg border border-white/10 px-3 py-2">
              {POSITION_LABELS[p]}: <span className="text-on-surface">{slots[p]}</span> plazas
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
