import { POSITIONS, SKILL_LEVELS, type SkillLevel, type Team, type TeamStats } from '../../types';

export function scoreFor(level: SkillLevel, scoring: Record<SkillLevel, number>): number {
  return scoring[level];
}

export function computeTeamStats(team: Team): TeamStats {
  const positionCounts = { arquero: 0, defensa: 0, mediocampista: 0, delantero: 0 };
  const levelDistribution = Object.fromEntries(SKILL_LEVELS.map((level) => [level, 0])) as Record<SkillLevel, number>;
  let totalScore = 0;

  for (const assigned of team.players) {
    positionCounts[assigned.assignedPosition] += 1;
    levelDistribution[assigned.player.positionLevels[assigned.assignedPosition]] += 1;
    totalScore += assigned.score;
  }

  return {
    teamId: team.id,
    totalScore,
    averageScore: team.players.length > 0 ? totalScore / team.players.length : 0,
    positionCounts,
    levelDistribution,
  };
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return mean(values.map((v) => (v - m) ** 2));
}

/**
 * Función objetivo para la búsqueda local: combina el desequilibrio del puntaje
 * total por equipo con el desequilibrio del nivel promedio por posición entre equipos,
 * para evitar que un equipo concentre a los mejores jugadores en general o en una posición puntual.
 */
export function evaluateBalance(teams: Team[]): number {
  const totals = teams.map((t) => t.players.reduce((sum, p) => sum + p.score, 0));
  let objective = variance(totals);

  for (const position of POSITIONS) {
    const avgByTeam = teams.map((t) => {
      const inPosition = t.players.filter((p) => p.assignedPosition === position);
      if (inPosition.length === 0) return 0;
      return mean(inPosition.map((p) => p.score));
    });
    objective += 0.3 * variance(avgByTeam);
  }

  return objective;
}

export function summarize(teams: Team[]) {
  const stats = teams.map(computeTeamStats);
  const totals = stats.map((s) => s.totalScore);
  const maxDiff = totals.length > 0 ? Math.max(...totals) - Math.min(...totals) : 0;
  const strongest = stats.reduce((best, s) => (s.totalScore > best.totalScore ? s : best), stats[0]);
  const weakest = stats.reduce((worst, s) => (s.totalScore < worst.totalScore ? s : worst), stats[0]);

  return {
    stats,
    maxDiff,
    strongestTeamId: strongest?.teamId ?? '',
    weakestTeamId: weakest?.teamId ?? '',
  };
}

export { SKILL_LEVELS };
