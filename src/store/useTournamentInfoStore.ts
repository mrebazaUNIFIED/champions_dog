import { create } from 'zustand';
import { repository } from '../lib/data';
import { defaultTournamentInfo, type TournamentInfo } from '../types';

interface TournamentInfoState {
  info: TournamentInfo;
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (info: TournamentInfo) => Promise<void>;
}

export const useTournamentInfoStore = create<TournamentInfoState>((set) => ({
  info: defaultTournamentInfo(),
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const info = await repository.getTournamentInfo();
    set({ info: info ?? defaultTournamentInfo(), loading: false, loaded: true });
  },

  save: async (info) => {
    const updated: TournamentInfo = { ...info, updatedAt: new Date().toISOString() };
    await repository.saveTournamentInfo(updated);
    set({ info: updated });
  },
}));
