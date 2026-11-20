import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { repository } from '../lib/data';
import type { TournamentTeam } from '../types';

export type TeamInput = Omit<TournamentTeam, 'id' | 'createdAt' | 'updatedAt'>;

interface TeamsState {
  teams: TournamentTeam[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  addTeam: (input: TeamInput) => Promise<TournamentTeam>;
  updateTeam: (id: string, patch: Partial<TeamInput>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    const teams = await repository.listTeams();
    set({ teams, loading: false, loaded: true });
  },

  addTeam: async (input) => {
    const now = new Date().toISOString();
    const team: TournamentTeam = { ...input, id: uuid(), createdAt: now, updatedAt: now };
    await repository.upsertTeam(team);
    set({ teams: [...get().teams, team] });
    return team;
  },

  updateTeam: async (id, patch) => {
    const existing = get().teams.find((t) => t.id === id);
    if (!existing) return;
    const updated: TournamentTeam = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await repository.upsertTeam(updated);
    set({ teams: get().teams.map((t) => (t.id === id ? updated : t)) });
  },

  deleteTeam: async (id) => {
    await repository.deleteTeam(id);
    set({ teams: get().teams.filter((t) => t.id !== id) });
  },
}));
