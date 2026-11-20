export interface TournamentTeam {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
  playerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchEventType = 'goal' | 'yellow' | 'red';

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Por jugarse',
  live: 'En vivo',
  finished: 'Finalizado',
};

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  teamId: string;
  playerId: string;
  minute?: number;
  createdAt: string;
}

export interface Match {
  id: string;
  phase: string;
  homeTeamId: string;
  awayTeamId: string;
  status: MatchStatus;
  scheduledAt?: string;
  homeLineup: string[];
  awayLineup: string[];
  events: MatchEvent[];
  createdAt: string;
  updatedAt: string;
}

export type MatchInput = Omit<Match, 'id' | 'events' | 'createdAt' | 'updatedAt'>;

export interface Award {
  id: string;
  title: string;
  winnerPlayerId?: string;
  winnerName?: string;
  note?: string;
  createdAt: string;
}

export type AwardInput = Omit<Award, 'id' | 'createdAt'>;

export type TournamentStatus = 'preparacion' | 'en_curso' | 'finalizado';

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  preparacion: 'En preparación',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
};

export interface TournamentInfo {
  name: string;
  periodStart?: string;
  periodEnd?: string;
  status: TournamentStatus;
  organizer?: string;
  bannerUrl?: string;
  updatedAt: string;
}

export function defaultTournamentInfo(): TournamentInfo {
  return {
    name: '4.º Campeonato Perritos Locos',
    status: 'preparacion',
    updatedAt: new Date().toISOString(),
  };
}

/** Goles de cada equipo en un partido, contando los eventos `goal`. */
export function matchScore(match: Pick<Match, 'events' | 'homeTeamId' | 'awayTeamId'>): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const event of match.events) {
    if (event.type !== 'goal') continue;
    if (event.teamId === match.homeTeamId) home += 1;
    else if (event.teamId === match.awayTeamId) away += 1;
  }
  return { home, away };
}

export interface StandingRow {
  teamId: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  percentage: number;
}

/** Tabla de posiciones, solo a partir de partidos finalizados. 3 puntos por victoria, 1 por empate. */
export function computeStandings(teams: TournamentTeam[], matches: Match[]): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const team of teams) {
    rows.set(team.id, {
      teamId: team.id,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      percentage: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== 'finished') continue;
    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;

    const { home: homeGoals, away: awayGoals } = matchScore(match);
    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeGoals < awayGoals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of rows.values()) {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
    row.percentage = row.played > 0 ? Math.round((row.points / (row.played * 3)) * 100) : 0;
  }

  return [...rows.values()].sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor,
  );
}

export interface PlayerTally {
  playerId: string;
  teamId: string;
  count: number;
}

/** Goleadores: cantidad de goles por jugador, de mayor a menor. */
export function topScorers(matches: Match[]): PlayerTally[] {
  const tally = new Map<string, PlayerTally>();
  for (const match of matches) {
    for (const event of match.events) {
      if (event.type !== 'goal') continue;
      const existing = tally.get(event.playerId);
      if (existing) existing.count += 1;
      else tally.set(event.playerId, { playerId: event.playerId, teamId: event.teamId, count: 1 });
    }
  }
  return [...tally.values()].sort((a, b) => b.count - a.count);
}

export interface CardTally {
  playerId: string;
  teamId: string;
  yellow: number;
  red: number;
}

/** Sanciones: tarjetas amarillas y rojas por jugador, de mayor a menor total. */
export function cardTally(matches: Match[]): CardTally[] {
  const tally = new Map<string, CardTally>();
  for (const match of matches) {
    for (const event of match.events) {
      if (event.type !== 'yellow' && event.type !== 'red') continue;
      const existing = tally.get(event.playerId) ?? { playerId: event.playerId, teamId: event.teamId, yellow: 0, red: 0 };
      if (event.type === 'yellow') existing.yellow += 1;
      else existing.red += 1;
      tally.set(event.playerId, existing);
    }
  }
  return [...tally.values()].sort((a, b) => b.yellow + b.red - (a.yellow + a.red));
}
