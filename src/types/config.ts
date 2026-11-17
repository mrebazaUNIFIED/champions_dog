import { DEFAULT_SCORING, NUMBER_OF_TEAMS, type Position, type SkillLevel } from './common';

export type Formation = Record<Position, number>;

export const DEFAULT_FORMATION: Formation = {
  arquero: 1,
  defensa: 2,
  mediocampista: 1,
  delantero: 2,
};

export const DEFAULT_TEAM_COLORS = [
  '#22c55e', // verde
  '#3b82f6', // azul
  '#ef4444', // rojo
  '#eab308', // amarillo
  '#a855f7', // violeta
  '#f97316', // naranja
];

export interface TeamDefault {
  name: string;
  color: string;
}

export interface ChampionshipConfig {
  numberOfTeams: number;
  formation: Formation;
  scoring: Record<SkillLevel, number>;
  teamDefaults: TeamDefault[];
  updatedAt: string;
}

export function defaultChampionshipConfig(): ChampionshipConfig {
  return {
    numberOfTeams: NUMBER_OF_TEAMS,
    formation: { ...DEFAULT_FORMATION },
    scoring: { ...DEFAULT_SCORING },
    teamDefaults: Array.from({ length: NUMBER_OF_TEAMS }, (_, i) => ({
      name: `Equipo ${i + 1}`,
      color: DEFAULT_TEAM_COLORS[i % DEFAULT_TEAM_COLORS.length],
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function formationTotal(formation: Formation): number {
  return Object.values(formation).reduce((a, b) => a + b, 0);
}
