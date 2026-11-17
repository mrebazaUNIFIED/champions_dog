import type { ChampionshipConfig } from './config';
import type { Player } from './player';
import type { SelectionResult } from './team';

export interface HistoryEntry {
  id: string;
  createdAt: string;
  configSnapshot: ChampionshipConfig;
  playersSnapshot: Player[];
  result: SelectionResult;
  label?: string;
}
