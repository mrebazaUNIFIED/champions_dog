import type { ChampionshipConfig, HistoryEntry, Player, Position, SelectionResult, SkillLevel, VoteRecord } from '../../types';
import type { DataRepository } from './repository.types';

const KEYS = {
  players: 'pdl.players',
  config: 'pdl.config',
  history: 'pdl.history',
  currentSelection: 'pdl.currentSelection',
  votes: 'pdl.votes',
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

  async listVotes(): Promise<VoteRecord[]> {
    return read<VoteRecord[]>(KEYS.votes, []);
  }

  async upsertVote(record: VoteRecord): Promise<void> {
    const votes = await this.listVotes();
    const idx = votes.findIndex((v) => v.playerId === record.playerId && v.voterId === record.voterId && v.position === record.position);
    if (idx >= 0) votes[idx] = record;
    else votes.push(record);
    write(KEYS.votes, votes);
  }

  async applyPositionLevel(playerId: string, position: Position, level: SkillLevel): Promise<void> {
    const players = await this.listPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    players[idx] = {
      ...players[idx],
      positionLevels: { ...players[idx].positionLevels, [position]: level },
      updatedAt: new Date().toISOString(),
    };
    write(KEYS.players, players);
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
