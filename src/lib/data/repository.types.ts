import type { ChampionshipConfig, HistoryEntry, Player, PlayerVotes, SelectionResult } from '../../types';

export interface DataRepository {
  readonly backend: 'supabase' | 'local';

  listPlayers(): Promise<Player[]>;
  upsertPlayer(player: Player): Promise<void>;
  upsertPlayers(players: Player[]): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  listPlayerVotes(): Promise<PlayerVotes[]>;
  upsertPlayerVotes(votes: PlayerVotes): Promise<void>;

  getConfig(): Promise<ChampionshipConfig | null>;
  saveConfig(config: ChampionshipConfig): Promise<void>;

  listHistory(): Promise<HistoryEntry[]>;
  addHistoryEntry(entry: HistoryEntry): Promise<void>;

  getCurrentSelection(): Promise<SelectionResult | null>;
  saveCurrentSelection(result: SelectionResult | null): Promise<void>;
}
