import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { ChampionshipConfig, HistoryEntry, Player, SelectionResult } from '../types';

interface HistoryState {
  entries: HistoryEntry[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  addEntry: (
    result: SelectionResult,
    config: ChampionshipConfig,
    players: Player[],
    label?: string,
  ) => Promise<HistoryEntry>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const entries = await repository.listHistory();
    set({ entries, loading: false, loaded: true });
  },

  addEntry: async (result, config, players, label) => {
    const entry: HistoryEntry = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      configSnapshot: config,
      playersSnapshot: players,
      result,
      label,
    };
    await repository.addHistoryEntry(entry);
    set({ entries: [entry, ...get().entries] });
    return entry;
  },
}));
