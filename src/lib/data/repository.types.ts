import type { Award, Match, Player, TournamentInfo, TournamentTeam } from '../../types';

export interface DataRepository {
  readonly backend: 'supabase' | 'local';

  listPlayers(): Promise<Player[]>;
  upsertPlayer(player: Player): Promise<void>;
  upsertPlayers(players: Player[]): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  listTeams(): Promise<TournamentTeam[]>;
  upsertTeam(team: TournamentTeam): Promise<void>;
  deleteTeam(id: string): Promise<void>;

  listMatches(): Promise<Match[]>;
  upsertMatch(match: Match): Promise<void>;
  deleteMatch(id: string): Promise<void>;

  listAwards(): Promise<Award[]>;
  upsertAward(award: Award): Promise<void>;
  deleteAward(id: string): Promise<void>;

  getTournamentInfo(): Promise<TournamentInfo | null>;
  saveTournamentInfo(info: TournamentInfo): Promise<void>;
}
