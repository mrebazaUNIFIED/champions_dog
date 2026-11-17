import type { ChampionshipConfig, HistoryEntry, Player, PlayerVotes, SelectionResult } from '../../types';
import type { DataRepository } from './repository.types';

const KEYS = {
  players: 'pdl.players',
  config: 'pdl.config',
  history: 'pdl.history',
  currentSelection: 'pdl.currentSelection',
  playerVotes: 'pdl.playerVotes',
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

  async listPlayerVotes(): Promise<PlayerVotes[]> {
    return read<PlayerVotes[]>(KEYS.playerVotes, []);
  }

  async upsertPlayerVotes(votes: PlayerVotes): Promise<void> {
    const list = await this.listPlayerVotes();
    const idx = list.findIndex((v) => v.playerId === votes.playerId);
    if (idx >= 0) list[idx] = votes;
    else list.push(votes);
    write(KEYS.playerVotes, list);
  }

  async getConfig(): Promise<ChampionshipConfig | null> {
    return read<ChampionshipConfig | null>(KEYS.config, null);
  }

  async saveConfig(config: ChampionshipConfig): Promise<void> {
    write(KEYS.config, config);
  }

  async listHistory(): Promise<HistoryEntry[]> {
    return read<HistoryEntry[]>(KEYS.history, []);
  }

  async addHistoryEntry(entry: HistoryEntry): Promise<void> {
    const history = await this.listHistory();
    history.unshift(entry);
    write(KEYS.history, history);
  }

  async getCurrentSelection(): Promise<SelectionResult | null> {
    return read<SelectionResult | null>(KEYS.currentSelection, null);
  }

  async saveCurrentSelection(result: SelectionResult | null): Promise<void> {
    write(KEYS.currentSelection, result);
  }
}
