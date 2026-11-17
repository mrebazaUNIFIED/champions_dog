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

// Varios votos se disparan en ráfaga (4 posiciones de un mismo jugador en segundos).
// Sin esto, dos escrituras en vuelo leen el mismo estado viejo antes de que la primera
// termine de guardar, y la segunda pisa a la primera perdiendo ese voto. Se serializan
// todas las escrituras en una cola para que cada lectura vea siempre el resultado de la anterior.
let writeQueue: Promise<void> = Promise.resolve();

export const useVotesStore = create<VotesState>((set, get) => ({
  votes: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const votes = await repository.listPlayerVotes();
    set({ votes, loading: false, loaded: true });
  },

  setVote: (playerId, voterId, position, level) => {
    const run = async () => {
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
    };
    const result = writeQueue.then(run);
    writeQueue = result.catch(() => {});
    return result;
  },
}));
