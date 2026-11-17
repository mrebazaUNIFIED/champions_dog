import { POSITIONS, type Position, type SkillLevel } from './common';

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

/** Nivel general de un jugador: el promedio de sus 4 niveles por posición, redondeado 1-6. */
export function generalLevel(player: Pick<Player, 'positionLevels'>): SkillLevel {
  const levels = POSITIONS.map((p) => player.positionLevels[p]);
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  return Math.min(6, Math.max(1, Math.round(avg))) as SkillLevel;
}
