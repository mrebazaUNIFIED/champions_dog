import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { Award, AwardInput } from '../types';

interface AwardsState {
  awards: Award[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  addAward: (input: AwardInput) => Promise<Award>;
  deleteAward: (id: string) => Promise<void>;
}

export const useAwardsStore = create<AwardsState>((set, get) => ({
  awards: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const awards = await repository.listAwards();
    set({ awards, loading: false, loaded: true });
  },

  addAward: async (input) => {
    const award: Award = { ...input, id: uuid(), createdAt: new Date().toISOString() };
    await repository.upsertAward(award);
    set({ awards: [...get().awards, award] });
    return award;
  },

  deleteAward: async (id) => {
    await repository.deleteAward(id);
    set({ awards: get().awards.filter((a) => a.id !== id) });
  },
}));
