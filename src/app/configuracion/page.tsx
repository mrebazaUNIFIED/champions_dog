'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiCloud, FiDatabase, FiSave } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card, CardTitle } from '../../components/common/Card';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { useConfigStore } from '../../store/useConfigStore';
import { SKILL_LABELS, SKILL_LEVELS, type SkillLevel } from '../../types';

export default function ConfiguracionPage() {
  const config = useConfigStore((s) => s.config);
  const save = useConfigStore((s) => s.save);

  const [scoring, setScoring] = useState(config.scoring);
  const [teams, setTeams] = useState(config.teamDefaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoring(config.scoring);
    setTeams(config.teamDefaults);
  }, [config.scoring, config.teamDefaults]);

  async function handleSave() {
    await save({ ...config, scoring, teamDefaults: teams });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Configuración general</h2>
        <p className="text-sm text-ink-500">Puntuación por nivel, nombres/colores por defecto de los equipos y estado de persistencia.</p>
      </div>

      <Card>
        <CardTitle>Sistema de puntuación por nivel</CardTitle>
        <p className="mt-1 text-sm text-ink-500">Usado para calcular el puntaje individual y total de cada equipo.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SKILL_LEVELS.map((level) => (
            <div key={level}>
              <label className="mb-1 block text-xs text-ink-500">
                Nivel {level} · {SKILL_LABELS[level]}
              </label>
              <input
                type="number"
                min={0}
                value={scoring[level]}
                onChange={(e) =>
                  setScoring((s) => ({ ...s, [level]: Number(e.target.value) || 0 }) as Record<SkillLevel, number>)
                }
                className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Nombres y colores por defecto de los equipos</CardTitle>
        <p className="mt-1 text-sm text-ink-500">Se usan como punto de partida al generar una selección; luego se pueden renombrar.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-200 p-2">
              <input
                type="color"
                value={t.color}
                onChange={(e) =>
                  setTeams((ts) => ts.map((team, idx) => (idx === i ? { ...team, color: e.target.value } : team)))
                }
                className="h-9 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent"
              />
              <input
                value={t.name}
                onChange={(e) =>
                  setTeams((ts) => ts.map((team, idx) => (idx === i ? { ...team, name: e.target.value } : team)))
                }
                className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {saved ? <FiCheckCircle /> : <FiSave />} {saved ? 'Guardado' : 'Guardar configuración'}
        </Button>
      </div>

      <Card>
        <CardTitle>Persistencia de datos</CardTitle>
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            isSupabaseConfigured ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-700'
          }`}
        >
          {isSupabaseConfigured ? <FiCloud /> : <FiDatabase />}
          {isSupabaseConfigured
            ? 'Conectado a Supabase: jugadores, configuración, selecciones e historial se guardan en la base de datos.'
            : 'Modo local: los datos se guardan en este navegador (localStorage).'}
        </div>
        {!isSupabaseConfigured && (
          <div className="mt-3 space-y-1 text-sm text-ink-500">
            <p>Para conectar Supabase más adelante, sin perder nada de lo ya construido:</p>
            <ol className="list-inside list-decimal space-y-1 pl-1">
              <li>
                Corré los scripts <code className="rounded bg-surface-100 px-1 py-0.5 text-xs">supabase/migrations/0001_init.sql</code> y{' '}
                <code className="rounded bg-surface-100 px-1 py-0.5 text-xs">0002_storage.sql</code> en el SQL editor de tu proyecto de
                Supabase (el segundo crea el bucket para las fotos de jugadores).
              </li>
              <li>
                Completá <code className="rounded bg-surface-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
                <code className="rounded bg-surface-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{' '}
                <code className="rounded bg-surface-100 px-1 py-0.5 text-xs">.env.local</code>.
              </li>
              <li>Reiniciá la app: va a empezar a usar Supabase automáticamente, sin tocar código.</li>
            </ol>
          </div>
        )}
      </Card>
    </div>
  );
}
