export type Position = 'arquero' | 'defensa' | 'mediocampista' | 'delantero';

export const POSITIONS: Position[] = ['arquero', 'defensa', 'mediocampista', 'delantero'];

export const POSITION_LABELS: Record<Position, string> = {
  arquero: 'Arquero',
  defensa: 'Defensa',
  mediocampista: 'Mediocampista',
  delantero: 'Delantero',
};

export type SkillLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const SKILL_LEVELS: SkillLevel[] = [1, 2, 3, 4, 5, 6];

export const SKILL_LABELS: Record<SkillLevel, string> = {
  1: 'Excelente',
  2: 'Muy bueno',
  3: 'Bueno',
  4: 'Regular',
  5: 'Flojo',
  6: 'Principiante',
};

export const DEFAULT_SCORING: Record<SkillLevel, number> = {
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

export const NUMBER_OF_TEAMS = 6;
