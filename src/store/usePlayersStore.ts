import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { Player, PlayerInput } from '../types';

interface PlayersState {
  players: Player[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  addPlayer: (input: PlayerInput) => Promise<Player>;
  updatePlayer: (id: string, patch: Partial<PlayerInput>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  importPlayers: (inputs: PlayerInput[]) => Promise<number>;
}

// Serializa las escrituras: sin esto, dos updatePlayer casi simultáneos sobre el mismo
// jugador podrían leer el mismo estado viejo antes de que el primero termine de guardar,
// y el segundo lo pisaría perdiendo ese cambio.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(run: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(run);
  writeQueue = result.catch(() => {});
  return result;
}

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: [],
  loading: false,
  loaded: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const players = await repository.listPlayers();
      set({ players, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Error al cargar jugadores' });
    }
  },

  addPlayer: (input) =>
    enqueue(async () => {
      const now = new Date().toISOString();
      const player: Player = { ...input, id: uuid(), createdAt: now, updatedAt: now };
      await repository.upsertPlayer(player);
      set({ players: [...get().players, player] });
      return player;
    }),

  updatePlayer: (id, patch) =>
    enqueue(async () => {
      const existing = get().players.find((p) => p.id === id);
      if (!existing) return;
      const updated: Player = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      await repository.upsertPlayer(updated);
      set({ players: get().players.map((p) => (p.id === id ? updated : p)) });
    }),

  deletePlayer: (id) =>
    enqueue(async () => {
      await repository.deletePlayer(id);
      set({ players: get().players.filter((p) => p.id !== id) });
    }),

  importPlayers: (inputs) =>
    enqueue(async () => {
      const now = new Date().toISOString();
      const newPlayers: Player[] = inputs.map((input) => ({ ...input, id: uuid(), createdAt: now, updatedAt: now }));
      await repository.upsertPlayers(newPlayers);
      set({ players: [...get().players, ...newPlayers] });
      return newPlayers.length;
    }),
}));
