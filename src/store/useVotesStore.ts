import { create } from 'zustand';
import { repository } from '../lib/data';
import type { Position, SkillLevel, VoteRecord, VoterId } from '../types';

interface VotesState {
  votes: VoteRecord[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setVote: (playerId: string, voterId: VoterId, position: Position, level: SkillLevel) => Promise<void>;
}

export const useVotesStore = create<VotesState>((set, get) => ({
  votes: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const votes = await repository.listVotes();
    set({ votes, loading: false, loaded: true });
  },

  // Cada voto es su propia fila en la base (ver repository.types.ts): un upsert acá nunca
  // puede pisar el voto de otro votante u otra posición, así que no hace falta serializar
  // ni leer-modificar-escribir nada.
  setVote: async (playerId, voterId, position, level) => {
    const record: VoteRecord = { playerId, voterId, position, level, updatedAt: new Date().toISOString() };
    await repository.upsertVote(record);
    set({
      votes: [
        ...get().votes.filter((v) => !(v.playerId === playerId && v.voterId === voterId && v.position === position)),
        record,
      ],
    });
  },
}));
