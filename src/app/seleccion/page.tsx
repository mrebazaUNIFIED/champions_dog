'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiGrid,
  FiFileText,
  FiImage,
  FiZap,
  FiSave,
  FiLoader,
  FiTrash2,
} from 'react-icons/fi';
import { BallIcon } from '../../components/common/BallIcon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TeamCard } from '../../components/teams/TeamCard';
import { checkFeasibility } from '../../lib/algorithms/teamValidation';
import { exportSelectionToExcel } from '../../lib/export/excel';
import { exportNodeToImage } from '../../lib/export/image';
import { exportSelectionToPdf } from '../../lib/export/pdf';
import { useConfigStore } from '../../store/useConfigStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useSelectionStore } from '../../store/useSelectionStore';

export default function SeleccionPage() {
  const players = usePlayersStore((s) => s.players);
  const config = useConfigStore((s) => s.config);
  const {
    current,
    proposals,
    generating,
    error,
    loaded,
    loadCurrent,
    generate,
    chooseProposal,
    discard,
    swapPlayers,
    replaceWithBench,
    renameTeam,
  } = useSelectionStore();
  const addHistoryEntry = useHistoryStore((s) => s.addEntry);

  const [selected, setSelected] = useState<{ teamId: string; playerId: string } | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saveHistoryOpen, setSaveHistoryOpen] = useState(false);
  const [historyLabel, setHistoryLabel] = useState('');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'image' | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  async function handleExport(kind: 'pdf' | 'excel' | 'image') {
    if (!current || exporting) return;
    setExporting(kind);
    try {
      if (kind === 'pdf') await exportSelectionToPdf(current);
      if (kind === 'excel') await exportSelectionToExcel(current);
      if (kind === 'image' && exportRef.current) await exportNodeToImage(exportRef.current);
    } finally {
      setExporting(null);
    }
  }

  useEffect(() => {
    if (!loaded) void loadCurrent();
  }, [loaded, loadCurrent]);

  const feasibility = checkFeasibility(players, config.formation, config.numberOfTeams);

  async function runGenerate() {
    setSwapError(null);
    setShowAnimation(true);
    await generate(players, config, 3);
    setTimeout(() => setShowAnimation(false), 900);
  }

  function handleGenerateClick() {
    if (current) {
      setConfirmRegenerate(true);
      return;
    }
    void runGenerate();
  }

  function handleSelect(teamId: string, playerId: string) {
    setSwapError(null);
    if (!selected) {
      setSelected({ teamId, playerId });
      return;
    }
    if (selected.teamId === teamId && selected.playerId === playerId) {
      setSelected(null);
      return;
    }
    if (selected.teamId === teamId) {
      setSelected({ teamId, playerId });
      return;
    }
    const result = swapPlayers(selected.teamId, selected.playerId, teamId, playerId);
    if (!result.ok) setSwapError(result.message ?? 'No se pudo intercambiar.');
    setSelected(null);
  }

  function handleReplace(teamId: string, outPlayerId: string, benchPlayerId: string) {
    const result = replaceWithBench(teamId, outPlayerId, benchPlayerId, config.scoring);
    if (!result.ok) setSwapError(result.message ?? 'No se pudo reemplazar.');
  }

  async function confirmSaveHistory() {
    if (!current) return;
    await addHistoryEntry(current, config, players, historyLabel.trim() || undefined);
    setSaveHistoryOpen(false);
    setHistoryLabel('');
    setSavedMessage('Selección guardada en el historial.');
    setTimeout(() => setSavedMessage(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Selección de equipos</h2>
          <p className="text-sm text-ink-500">Generá los 6 equipos y ajustalos manualmente si hace falta.</p>
        </div>
        <Button onClick={handleGenerateClick} disabled={!feasibility.ok || generating} className="px-6 py-3 text-base">
          <FiZap /> GENERAR SELECCIÓN DE EQUIPOS
        </Button>
      </div>

      {savedMessage && (
        <Card className="flex items-center gap-2 border-green-200 text-sm text-green-700">
          <FiCheckCircle /> {savedMessage}
        </Card>
      )}

      {!feasibility.ok && (
        <Card className="border-amber-200">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="mt-1 text-amber-600" />
            <div className="text-sm text-amber-700">
              <p>{feasibility.message}</p>
              {feasibility.shortages.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {feasibility.shortages.map((s) => (
                    <li key={s.position}>
                      · {s.position}: hay {s.eligibleAvailable}, se necesitan {s.needed}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 text-sm text-red-600">
          <FiAlertTriangle className="mr-2 inline" /> {error}
        </Card>
      )}

      {swapError && (
        <Card className="border-red-200 text-sm text-red-600">
          {swapError}
          <button className="ml-3 text-xs underline" onClick={() => setSwapError(null)}>
            Cerrar
          </button>
        </Card>
      )}

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-pitch-950/95"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="text-white"
            >
              <BallIcon className="h-16 w-16" />
            </motion.div>
            <p className="font-display text-lg font-semibold text-white">Armando los 6 equipos…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {proposals.length > 1 && (
        <Card>
          <p className="mb-3 text-sm text-ink-500">Propuestas generadas (ordenadas de más a menos equilibrada):</p>
          <div className="flex flex-wrap gap-2">
            {proposals.map((p, i) => (
              <button
                key={i}
                onClick={() => chooseProposal(i)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  current?.generatedAt === p.generatedAt
                    ? 'border-brand-500 bg-green-50 text-brand-600'
                    : 'border-surface-300 text-ink-500 hover:bg-surface-50'
                }`}
              >
                Propuesta {i + 1} · diferencia {p.maxDiff}
              </button>
            ))}
          </div>
        </Card>
      )}

      {current && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={exporting !== null} onClick={() => handleExport('pdf')}>
              {exporting === 'pdf' ? <FiLoader className="animate-spin" /> : <FiFileText />} PDF
            </Button>
            <Button variant="secondary" disabled={exporting !== null} onClick={() => handleExport('excel')}>
              {exporting === 'excel' ? <FiLoader className="animate-spin" /> : <FiGrid />} Excel
            </Button>
            <Button variant="secondary" disabled={exporting !== null} onClick={() => handleExport('image')}>
              {exporting === 'image' ? <FiLoader className="animate-spin" /> : <FiImage />} Imagen (WhatsApp)
            </Button>
            <Button variant="secondary" onClick={() => setSaveHistoryOpen(true)}>
              <FiSave /> Guardar en historial
            </Button>
            <Button variant="danger" onClick={() => setConfirmDiscard(true)}>
              <FiTrash2 /> Descartar
            </Button>
          </div>

          <div ref={exportRef} className="grid gap-4 bg-surface-50 p-1 sm:grid-cols-2 xl:grid-cols-3">
            {current.teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                stats={current.stats.find((s) => s.teamId === team.id)!}
                benchPlayers={current.unassignedPlayers}
                selected={selected}
                onSelectForSwap={(playerId) => handleSelect(team.id, playerId)}
                onReplace={(outId, benchId) => handleReplace(team.id, outId, benchId)}
                onRename={(name, color) => renameTeam(team.id, name, color)}
                isStrongest={team.id === current.strongestTeamId}
                isWeakest={team.id === current.weakestTeamId}
              />
            ))}
          </div>

          {current.unassignedPlayers.length > 0 && (
            <Card>
              <p className="mb-2 text-sm font-semibold text-ink-700">
                Jugadores no convocados ({current.unassignedPlayers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {current.unassignedPlayers.map((p) => (
                  <span key={p.id} className="rounded-full border border-surface-300 px-3 py-1 text-xs text-ink-500">
                    {p.fullName}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!current && !generating && feasibility.ok && (
        <Card className="text-center text-sm text-ink-400">
          Todavía no generaste la selección de equipos para esta edición.
        </Card>
      )}

      <Modal open={confirmRegenerate} onClose={() => setConfirmRegenerate(false)} title="Ya existe una selección generada">
        <p className="text-sm text-ink-700">
          ¿Querés descartarla y generar una nueva, o prefirís mantener la distribución actual?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmRegenerate(false)}>
            Mantener la actual
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmRegenerate(false);
              void runGenerate();
            }}
          >
            Descartar y generar de nuevo
          </Button>
        </div>
      </Modal>

      <Modal open={confirmDiscard} onClose={() => setConfirmDiscard(false)} title="Descartar selección actual">
        <p className="text-sm text-ink-700">Esta acción borra la distribución generada actualmente (no afecta el historial ya guardado).</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmDiscard(false);
              void discard();
            }}
          >
            Descartar
          </Button>
        </div>
      </Modal>

      <Modal open={saveHistoryOpen} onClose={() => setSaveHistoryOpen(false)} title="Guardar en historial">
        <label className="mb-1 block text-sm text-ink-500">Nombre para esta selección (opcional)</label>
        <input
          autoFocus
          value={historyLabel}
          onChange={(e) => setHistoryLabel(e.target.value)}
          placeholder="Ej: Fecha 4 - versión final"
          className="w-full rounded-lg border border-surface-300 bg-surface-0 px-3 py-2 text-ink-900 outline-none focus:border-brand-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setSaveHistoryOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void confirmSaveHistory()}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
