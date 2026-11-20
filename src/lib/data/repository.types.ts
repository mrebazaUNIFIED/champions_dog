import type {
  Award,
  ChampionshipConfig,
  HistoryEntry,
  Match,
  Player,
  Position,
  SelectionResult,
  SkillLevel,
  TournamentInfo,
  TournamentTeam,
  VoteRecord,
} from '../../types';

export interface DataRepository {
  readonly backend: 'supabase' | 'local';

  listPlayers(): Promise<Player[]>;
  upsertPlayer(player: Player): Promise<void>;
  upsertPlayers(players: Player[]): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  listVotes(): Promise<VoteRecord[]>;
  upsertVote(record: VoteRecord): Promise<void>;

  /** Aplica un nivel a una posición puntual de un jugador directamente en la base, de forma
   * atómica: nunca lee-modifica-escribe el objeto `positionLevels` completo desde el cliente,
   * así que dos votos concurrentes sobre posiciones distintas del mismo jugador nunca se pisan. */
  applyPositionLevel(playerId: string, position: Position, level: SkillLevel): Promise<void>;

  getConfig(): Promise<ChampionshipConfig | null>;
  saveConfig(config: ChampionshipConfig): Promise<void>;

  listHistory(): Promise<HistoryEntry[]>;
  addHistoryEntry(entry: HistoryEntry): Promise<void>;

  getCurrentSelection(): Promise<SelectionResult | null>;
  saveCurrentSelection(result: SelectionResult | null): Promise<void>;

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
