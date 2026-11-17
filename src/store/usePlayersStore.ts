import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { Player, PlayerInput, Position, SkillLevel } from '../types';

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
  /** Aplica el nivel de UNA posición directo en la base (ver DataRepository.applyPositionLevel):
   * a diferencia de updatePlayer, nunca lee-modifica-escribe positionLevels completo, así que
   * es seguro aunque otro votante esté aplicando el nivel de otra posición del mismo jugador
   * en simultáneo. */
  applyPositionLevel: (id: string, position: Position, level: SkillLevel) => Promise<void>;
}

// La votación dispara varios updatePlayer seguidos para el mismo jugador (uno por posición
// calificada). Sin serializar, dos escrituras en vuelo leen el mismo estado viejo antes de
// que la primera termine de guardar, y la segunda la pisa perdiendo ese cambio.
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

  applyPositionLevel: async (id, position, level) => {
    await repository.applyPositionLevel(id, position, level);
    set({
      players: get().players.map((p) =>
        p.id === id ? { ...p, positionLevels: { ...p.positionLevels, [position]: level }, updatedAt: new Date().toISOString() } : p,
      ),
    });
  },
}));
