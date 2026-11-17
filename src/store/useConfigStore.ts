import { create } from 'zustand';
import { repository } from '../lib/data';
import { defaultChampionshipConfig, type ChampionshipConfig } from '../types';

interface ConfigState {
  config: ChampionshipConfig;
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (config: ChampionshipConfig) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultChampionshipConfig(),
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const stored = await repository.getConfig();
    set({ config: stored ?? defaultChampionshipConfig(), loading: false, loaded: true });
  },

  save: async (config) => {
    const next = { ...config, updatedAt: new Date().toISOString() };
    await repository.saveConfig(next);
    set({ config: next });
  },
}));
