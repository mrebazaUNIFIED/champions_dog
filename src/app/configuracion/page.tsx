'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Card, CardTitle } from '../../components/common/Card';
import { DogLoader } from '../../components/common/DogLoader';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { uploadTournamentBanner } from '../../lib/supabase/storage';
import { useTournamentInfoStore } from '../../store/useTournamentInfoStore';
import { TOURNAMENT_STATUS_LABELS, type TournamentStatus } from '../../types';

export default function ConfiguracionPage() {
  const tournamentInfo = useTournamentInfoStore((s) => s.info);
  const tournamentInfoLoaded = useTournamentInfoStore((s) => s.loaded);
  const loadTournamentInfo = useTournamentInfoStore((s) => s.load);
  const saveTournamentInfo = useTournamentInfoStore((s) => s.save);

  const [tournamentForm, setTournamentForm] = useState(tournamentInfo);
  const [tournamentSaved, setTournamentSaved] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentInfoLoaded) void loadTournamentInfo();
  }, [tournamentInfoLoaded, loadTournamentInfo]);

  useEffect(() => {
    setTournamentForm(tournamentInfo);
  }, [tournamentInfo]);

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
        <h2 className="font-display text-2xl font-bold text-on-surface">Configuración general</h2>
        <p className="text-sm text-on-surface-variant">Datos del torneo y estado de persistencia.</p>
      </div>

      <Card>
        <CardTitle>Información del torneo</CardTitle>
        <p className="mt-1 text-sm text-on-surface-variant">Se muestra en el Inicio: nombre, período, estado, organizador y banner.</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant">
            {uploadingBanner ? (
              <DogLoader size={28} />
            ) : tournamentForm.bannerUrl ? (
              <img src={tournamentForm.bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs">Sin banner</span>
            )}
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-on-surface-variant">Banner (opcional)</span>
            <input type="file" accept="image/*" onChange={handleBanner} disabled={uploadingBanner} className="text-xs text-on-surface-variant" />
            {bannerError && <p className="mt-1 text-xs text-secondary-container">{bannerError}</p>}
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Nombre del torneo</label>
            <input
              value={tournamentForm.name}
              onChange={(e) => setTournamentForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Organizador</label>
            <input
              value={tournamentForm.organizer ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, organizer: e.target.value }))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Inicio</label>
            <input
              type="date"
              value={tournamentForm.periodStart ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, periodStart: e.target.value }))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Fin</label>
            <input
              type="date"
              value={tournamentForm.periodEnd ?? ''}
              onChange={(e) => setTournamentForm((f) => ({ ...f, periodEnd: e.target.value }))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Estado</label>
            <select
              value={tournamentForm.status}
              onChange={(e) => setTournamentForm((f) => ({ ...f, status: e.target.value as TournamentStatus }))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
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
            {tournamentSaved ? <Icon name="check_circle" /> : <Icon name="save" />} {tournamentSaved ? 'Guardado' : 'Guardar información del torneo'}
          </Button>
        </div>
      </Card>


    </div>
  );
}
