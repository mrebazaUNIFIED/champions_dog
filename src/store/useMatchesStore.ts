import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { Match, MatchEvent, MatchEventType, MatchInput } from '../types';

interface MatchesState {
  matches: Match[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  addMatch: (input: MatchInput) => Promise<Match>;
  updateMatch: (id: string, patch: Partial<MatchInput>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  addEvent: (matchId: string, teamId: string, playerId: string, type: MatchEventType) => Promise<void>;
  removeEvent: (matchId: string, eventId: string) => Promise<void>;
  startClock: (matchId: string) => Promise<void>;
  pauseClock: (matchId: string) => Promise<void>;
  resetClock: (matchId: string) => Promise<void>;
}

// Varios goles/tarjetas se cargan en ráfaga durante un partido en vivo. Sin serializar,
// dos escrituras en vuelo leen el mismo estado viejo antes de que la primera termine de
// guardar, y la segunda la pisa perdiendo ese evento (mismo problema que ya tuvimos con
// los votos y con los jugadores).
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(run: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(run);
  writeQueue = result.catch(() => {});
  return result;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const matches = await repository.listMatches();
    set({ matches, loading: false, loaded: true });
  },

  addMatch: (input) =>
    enqueue(async () => {
      const now = new Date().toISOString();
      const match: Match = {
        ...input,
        id: uuid(),
        events: [],
        clockStatus: 'idle',
        clockElapsedMs: 0,
        createdAt: now,
        updatedAt: now,
      };
      await repository.upsertMatch(match);
      set({ matches: [...get().matches, match] });
      return match;
    }),

  updateMatch: (id, patch) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === id);
      if (!existing) return;
      const updated: Match = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      // Si el partido deja de estar "en vivo" (ej. se marca finalizado) con el cronómetro
      // corriendo, lo congelamos acá: si no, el overlay lo sigue mostrando corriendo para
      // siempre porque nada más lo pausa.
      if (updated.status !== 'live' && updated.clockStatus === 'running' && updated.clockStartedAt) {
        updated.clockElapsedMs += Math.max(0, Date.now() - new Date(updated.clockStartedAt).getTime());
        updated.clockStatus = 'paused';
        updated.clockStartedAt = undefined;
      }
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === id ? updated : m)) });
    }),

  deleteMatch: (id) =>
    enqueue(async () => {
      await repository.deleteMatch(id);
      set({ matches: get().matches.filter((m) => m.id !== id) });
    }),

  addEvent: (matchId, teamId, playerId, type) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === matchId);
      if (!existing) return;
      const event: MatchEvent = { id: uuid(), type, teamId, playerId, createdAt: new Date().toISOString() };
      const updated: Match = { ...existing, events: [...existing.events, event], updatedAt: new Date().toISOString() };
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === matchId ? updated : m)) });
    }),

  removeEvent: (matchId, eventId) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === matchId);
      if (!existing) return;
      const updated: Match = {
        ...existing,
        events: existing.events.filter((e) => e.id !== eventId),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === matchId ? updated : m)) });
    }),

  startClock: (matchId) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === matchId);
      if (!existing || existing.clockStatus === 'running') return;
      const updated: Match = {
        ...existing,
        clockStatus: 'running',
        clockStartedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === matchId ? updated : m)) });
    }),

  pauseClock: (matchId) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === matchId);
      if (!existing || existing.clockStatus !== 'running' || !existing.clockStartedAt) return;
      const elapsedMs = existing.clockElapsedMs + Math.max(0, Date.now() - new Date(existing.clockStartedAt).getTime());
      const updated: Match = {
        ...existing,
        clockStatus: 'paused',
        clockStartedAt: undefined,
        clockElapsedMs: elapsedMs,
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === matchId ? updated : m)) });
    }),

  resetClock: (matchId) =>
    enqueue(async () => {
      const existing = get().matches.find((m) => m.id === matchId);
      if (!existing) return;
      const updated: Match = {
        ...existing,
        clockStatus: 'idle',
        clockStartedAt: undefined,
        clockElapsedMs: 0,
        updatedAt: new Date().toISOString(),
      };
      await repository.upsertMatch(updated);
      set({ matches: get().matches.map((m) => (m.id === matchId ? updated : m)) });
    }),
}));
