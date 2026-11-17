import { create } from 'zustand';
import { repository } from '../lib/data';
import { generateProposals } from '../lib/algorithms/teamSelection';
import { summarize } from '../lib/algorithms/teamScoring';
import { isEligible } from '../lib/algorithms/teamValidation';
import type { ChampionshipConfig, Player, SelectionResult, SkillLevel } from '../types';

function recomputeResult(result: SelectionResult): SelectionResult {
  const { stats, maxDiff, strongestTeamId, weakestTeamId } = summarize(result.teams);
  return { ...result, stats, maxDiff, strongestTeamId, weakestTeamId };
}

interface SelectionState {
  current: SelectionResult | null;
  proposals: SelectionResult[];
  generating: boolean;
  error: string | null;
  loaded: boolean;

  loadCurrent: () => Promise<void>;
  generate: (players: Player[], config: ChampionshipConfig, proposalCount?: number) => Promise<void>;
  chooseProposal: (index: number) => Promise<void>;
  discard: () => Promise<void>;
  swapPlayers: (
    teamAId: string,
    playerIdA: string,
    teamBId: string,
    playerIdB: string,
    scoring: Record<SkillLevel, number>,
  ) => { ok: boolean; message?: string };
  replaceWithBench: (
    teamId: string,
    outPlayerId: string,
    benchPlayerId: string,
    scoring: Record<SkillLevel, number>,
  ) => { ok: boolean; message?: string };
  renameTeam: (teamId: string, name: string, color: string) => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  current: null,
  proposals: [],
  generating: false,
  error: null,
  loaded: false,

  loadCurrent: async () => {
    const current = await repository.getCurrentSelection();
    set({ current, loaded: true });
  },

  generate: async (players, config, proposalCount = 3) => {
    set({ generating: true, error: null });
    try {
      const proposals = generateProposals(players, config, proposalCount);
      if ('ok' in proposals) {
        set({ generating: false, error: proposals.message, proposals: [] });
        return;
      }
      const current = proposals[0];
      await repository.saveCurrentSelection(current);
      set({ proposals, current, generating: false });
    } catch (err) {
      set({ generating: false, error: err instanceof Error ? err.message : 'Error al generar los equipos' });
    }
  },

  chooseProposal: async (index) => {
    const proposal = get().proposals[index];
    if (!proposal) return;
    await repository.saveCurrentSelection(proposal);
    set({ current: proposal });
  },

  discard: async () => {
    await repository.saveCurrentSelection(null);
    set({ current: null, proposals: [] });
  },

  swapPlayers: (teamAId, playerIdA, teamBId, playerIdB, scoring) => {
    const { current } = get();
    if (!current) return { ok: false, message: 'No hay una selección activa.' };

    const teams = current.teams.map((t) => ({ ...t, players: [...t.players] }));
    const teamA = teams.find((t) => t.id === teamAId);
    const teamB = teams.find((t) => t.id === teamBId);
    if (!teamA || !teamB) return { ok: false, message: 'Equipo no encontrado.' };

    const idxA = teamA.players.findIndex((p) => p.player.id === playerIdA);
    const idxB = teamB.players.findIndex((p) => p.player.id === playerIdB);
    if (idxA === -1 || idxB === -1) return { ok: false, message: 'Jugador no encontrado en el equipo.' };

    const assignedA = teamA.players[idxA];
    const assignedB = teamB.players[idxB];
    const newPosForA = assignedB.assignedPosition;
    const newPosForB = assignedA.assignedPosition;

    if (!isEligible(assignedA.player, newPosForA)) {
      return { ok: false, message: `${assignedA.player.fullName} no puede jugar de ${newPosForA}.` };
    }
    if (!isEligible(assignedB.player, newPosForB)) {
      return { ok: false, message: `${assignedB.player.fullName} no puede jugar de ${newPosForB}.` };
    }

    teamA.players[idxA] = {
      player: assignedB.player,
      assignedPosition: newPosForA,
      score: scoring[assignedB.player.positionLevels[newPosForA]],
    };
    teamB.players[idxB] = {
      player: assignedA.player,
      assignedPosition: newPosForB,
      score: scoring[assignedA.player.positionLevels[newPosForB]],
    };

    const updated = recomputeResult({ ...current, teams });
    void repository.saveCurrentSelection(updated);
    set({ current: updated });
    return { ok: true };
  },

  replaceWithBench: (teamId, outPlayerId, benchPlayerId, scoring) => {
    const { current } = get();
    if (!current) return { ok: false, message: 'No hay una selección activa.' };

    const teams = current.teams.map((t) => ({ ...t, players: [...t.players] }));
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, message: 'Equipo no encontrado.' };

    const idx = team.players.findIndex((p) => p.player.id === outPlayerId);
    if (idx === -1) return { ok: false, message: 'Jugador no encontrado en el equipo.' };

    const bench = current.unassignedPlayers.find((p) => p.id === benchPlayerId);
    if (!bench) return { ok: false, message: 'Jugador suplente no encontrado.' };

    const slotPosition = team.players[idx].assignedPosition;
    if (!isEligible(bench, slotPosition)) {
      return { ok: false, message: `${bench.fullName} no puede jugar de ${slotPosition}.` };
    }

    const outgoing = team.players[idx].player;
    team.players[idx] = { player: bench, assignedPosition: slotPosition, score: scoring[bench.positionLevels[slotPosition]] };

    const unassignedPlayers = current.unassignedPlayers.filter((p) => p.id !== benchPlayerId).concat(outgoing);

    const updated = recomputeResult({ ...current, teams, unassignedPlayers });
    void repository.saveCurrentSelection(updated);
    set({ current: updated });
    return { ok: true };
  },

  renameTeam: (teamId, name, color) => {
    const { current } = get();
    if (!current) return;
    const teams = current.teams.map((t) => (t.id === teamId ? { ...t, name, color } : t));
    const updated = { ...current, teams };
    void repository.saveCurrentSelection(updated);
    set({ current: updated });
  },
}));
