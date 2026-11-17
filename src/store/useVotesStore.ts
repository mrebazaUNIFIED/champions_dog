import { create } from 'zustand';
import { repository } from '../lib/data';
import type { PlayerVotes, Position, SkillLevel, VoterId } from '../types';

interface VotesState {
  votes: PlayerVotes[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setVote: (playerId: string, voterId: VoterId, position: Position, level: SkillLevel | null) => Promise<void>;
}

export const useVotesStore = create<VotesState>((set, get) => ({
  votes: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const votes = await repository.listPlayerVotes();
    set({ votes, loading: false, loaded: true });
  },

  setVote: async (playerId, voterId, position, level) => {
    const existing = get().votes.find((v) => v.playerId === playerId);
    const voterVotes = { ...existing?.votes[voterId] };
    if (level === null) delete voterVotes[position];
    else voterVotes[position] = level;

    const nextVotes = { ...existing?.votes, [voterId]: voterVotes };
    const updated: PlayerVotes = { playerId, votes: nextVotes, updatedAt: new Date().toISOString() };
    await repository.upsertPlayerVotes(updated);
    set({
      votes: existing ? get().votes.map((v) => (v.playerId === playerId ? updated : v)) : [...get().votes, updated],
    });
  },
}));
