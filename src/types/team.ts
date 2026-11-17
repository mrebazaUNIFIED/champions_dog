import type { Player } from './player';
import type { Position, SkillLevel } from './common';

export interface AssignedPlayer {
  player: Player;
  assignedPosition: Position;
  score: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: AssignedPlayer[];
}

export interface TeamStats {
  teamId: string;
  totalScore: number;
  averageScore: number;
  positionCounts: Record<Position, number>;
  levelDistribution: Record<SkillLevel, number>;
}

export interface SelectionResult {
  teams: Team[];
  stats: TeamStats[];
  unassignedPlayers: Player[];
  maxDiff: number;
  strongestTeamId: string;
  weakestTeamId: string;
  generatedAt: string;
}
