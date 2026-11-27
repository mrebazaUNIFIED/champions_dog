import type { Match, Player, TournamentInfo, TournamentTeam } from '../../types';
import type { DataRepository } from './repository.types';

const KEYS = {
  players: 'pdl.players',
  teams: 'pdl.teams',
  matches: 'pdl.matches',
  tournamentInfo: 'pdl.tournamentInfo',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalRepository implements DataRepository {
  readonly backend = 'local' as const;

  async listPlayers(): Promise<Player[]> {
    return read<Player[]>(KEYS.players, []);
  }

  async upsertPlayer(player: Player): Promise<void> {
    const players = await this.listPlayers();
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx >= 0) players[idx] = player;
    else players.push(player);
    write(KEYS.players, players);
  }

  async upsertPlayers(newPlayers: Player[]): Promise<void> {
    const players = await this.listPlayers();
    for (const player of newPlayers) {
      const idx = players.findIndex((p) => p.id === player.id);
      if (idx >= 0) players[idx] = player;
      else players.push(player);
    }
    write(KEYS.players, players);
  }

  async deletePlayer(id: string): Promise<void> {
    const players = await this.listPlayers();
    write(
      KEYS.players,
      players.filter((p) => p.id !== id),
    );
  }

  async listTeams(): Promise<TournamentTeam[]> {
    return read<TournamentTeam[]>(KEYS.teams, []);
  }

  async upsertTeam(team: TournamentTeam): Promise<void> {
    const teams = await this.listTeams();
    const idx = teams.findIndex((t) => t.id === team.id);
    if (idx >= 0) teams[idx] = team;
    else teams.push(team);
    write(KEYS.teams, teams);
  }

  async deleteTeam(id: string): Promise<void> {
    const teams = await this.listTeams();
    write(KEYS.teams, teams.filter((t) => t.id !== id));
  }

  async listMatches(): Promise<Match[]> {
    return read<Match[]>(KEYS.matches, []);
  }

  async getMatch(id: string): Promise<Match | null> {
    const matches = await this.listMatches();
    return matches.find((m) => m.id === id) ?? null;
  }

  async upsertMatch(match: Match): Promise<void> {
    const matches = await this.listMatches();
    const idx = matches.findIndex((m) => m.id === match.id);
    if (idx >= 0) matches[idx] = match;
    else matches.push(match);
    write(KEYS.matches, matches);
  }

  async deleteMatch(id: string): Promise<void> {
    const matches = await this.listMatches();
    write(KEYS.matches, matches.filter((m) => m.id !== id));
  }

  async getTournamentInfo(): Promise<TournamentInfo | null> {
    return read<TournamentInfo | null>(KEYS.tournamentInfo, null);
  }

  async saveTournamentInfo(info: TournamentInfo): Promise<void> {
    write(KEYS.tournamentInfo, info);
  }
}
