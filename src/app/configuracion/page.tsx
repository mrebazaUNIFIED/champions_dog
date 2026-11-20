'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiCloud, FiDatabase, FiLoader, FiSave } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card, CardTitle } from '../../components/common/Card';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { uploadTournamentBanner } from '../../lib/supabase/storage';
import { useConfigStore } from '../../store/useConfigStore';
import { useTournamentInfoStore } from '../../store/useTournamentInfoStore';
import { SKILL_LABELS, SKILL_LEVELS, TOURNAMENT_STATUS_LABELS, type SkillLevel, type TournamentStatus } from '../../types';

export default function ConfiguracionPage() {
  const config = useConfigStore((s) => s.config);
  const save = useConfigStore((s) => s.save);

  const tournamentInfo = useTournamentInfoStore((s) => s.info);
  const tournamentInfoLoaded = useTournamentInfoStore((s) => s.loaded);
  const loadTournamentInfo = useTournamentInfoStore((s) => s.load);
  const saveTournamentInfo = useTournamentInfoStore((s) => s.save);

  const [scoring, setScoring] = useState(config.scoring);
  const [teams, setTeams] = useState(config.teamDefaults);
  const [saved, setSaved] = useState(false);

  const [tournamentForm, setTournamentForm] = useState(tournamentInfo);
  const [tournamentSaved, setTournamentSaved] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    setScoring(config.scoring);
    setTeams(config.teamDefaults);
  }, [config.scoring, config.teamDefaults]);

  useEffect(() => {
    if (!tournamentInfoLoaded) void loadTournamentInfo();
  }, [tournamentInfoLoaded, loadTournamentInfo]);

  useEffect(() => {
    setTournamentForm(tournamentInfo);
  }, [tournamentInfo]);

  async function handleSave() {
    await save({ ...config, scoring, teamDefaults: teams });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSaveTournament() {
    await saveTournamentInfo(tournamentForm);
    setTournamentSaved(true);
    setTimeout(() => setTournamentSaved(false), 2500);
  }

  async function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerError(null);

    if (isSupabaseConfigured) {
      setUploadingBanner(true);
      try {
        const url = await uploadTournamentBanner(file);
        setTournamentForm((f) => ({ ...f, bannerUrl: url }));
      } catch (err) {
        setBannerError(err instanceof Error ? err.message : 'No se pudo subir el banner.');
      } finally {
        setUploadingBanner(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setTournamentForm((f) => ({ ...f, bannerUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Configuración general</h2>
        <p className="text-sm text-ink-500">Datos del torneo, puntuación por nivel, nombres/colores por defecto de los equipos y estado de persistencia.</p>
      </div>

      <Card>
        <CardTitle>Información del torneo</CardTitle>
        <p className="mt-1 text-sm text-ink-500">Se muestra en el Inicio: nombre, período, estado, organizador y banner.</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-300 bg-surface-100 text-ink-400">
            {uploadingBanner ? (
              <FiLoader className="animate-spin text-xl text-brand-400" />
            ) : tournamentForm.bannerUrl ? (
              <img src={tournamentForm.bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs">Sin banner</span>
            )}
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-ink-500">Banner (opcional)</span>
            <input type="file" accept="image/*" onChange={handleBanner} disabled={uploadingBanner} className="text-xs text-ink-500" />
            {bannerError && <p className="mt-1 text-xs text-red-600">{bannerError}</p>}
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-500">Nombre del torneo</label>
            <input
              value={tournamentForm.name}
              onChange={(e) => setTournamentForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">Organizador</label>
            <input
              value={tournamentForm.organizer ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, organizer: e.target.value }))}
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">Inicio</label>
            <input
              type="date"
              value={tournamentForm.periodStart ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, periodStart: e.target.value }))}
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">Fin</label>
            <input
              type="date"
              value={tournamentForm.periodEnd ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, periodEnd: e.target.value }))}
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">Estado</label>
            <select
              value={tournamentForm.status}
              onChange={(e) => setTournamentForm((f) => ({ ...f, status: e.target.value as TournamentStatus }))}
              className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
            >
              {Object.entries(TOURNAMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveTournament} disabled={uploadingBanner}>
            {tournamentSaved ? <FiCheckCircle /> : <FiSave />} {tournamentSaved ? 'Guardado' : 'Guardar información del torneo'}
          </Button>
        </div>
      </Card>

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
