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

  addPlayer: async (input) => {
    const now = new Date().toISOString();
    const player: Player = { ...input, id: uuid(), createdAt: now, updatedAt: now };
    await repository.upsertPlayer(player);
    set({ players: [...get().players, player] });
    return player;
  },

  updatePlayer: async (id, patch) => {
    const existing = get().players.find((p) => p.id === id);
    if (!existing) return;
    const updated: Player = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await repository.upsertPlayer(updated);
    set({ players: get().players.map((p) => (p.id === id ? updated : p)) });
  },

  deletePlayer: async (id) => {
    await repository.deletePlayer(id);
    set({ players: get().players.filter((p) => p.id !== id) });
  },

  importPlayers: async (inputs) => {
    const now = new Date().toISOString();
    const newPlayers: Player[] = inputs.map((input) => ({ ...input, id: uuid(), createdAt: now, updatedAt: now }));
    await repository.upsertPlayers(newPlayers);
    set({ players: [...get().players, ...newPlayers] });
    return newPlayers.length;
  },
}));
