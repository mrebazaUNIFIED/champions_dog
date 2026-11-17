import type { Position, SkillLevel } from './common';

export interface Player {
  id: string;
  fullName: string;
  photoUrl?: string;
  primaryPosition: Position;
  secondaryPositions: Position[];
  positionLevels: Record<Position, SkillLevel>;
  available: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlayerInput = Omit<Player, 'id' | 'createdAt' | 'updatedAt'>;

export function defaultPositionLevels(level: SkillLevel = 3): Record<Position, SkillLevel> {
  return { arquero: level, defensa: level, mediocampista: level, delantero: level };
}

/** Nivel "de cabecera" de un jugador: el que tiene en su posición principal. */
export function overallLevel(player: Pick<Player, 'positionLevels' | 'primaryPosition'>): SkillLevel {
  return player.positionLevels[player.primaryPosition];
}
