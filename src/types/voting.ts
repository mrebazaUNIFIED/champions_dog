import { POSITIONS, type Position, type SkillLevel } from './common';

export type VoterId = 'marco' | 'luis' | 'andair' | 'edwin' | 'frank' | 'heder' | 'jenry' | 'marlon';

export interface Voter {
  id: VoterId;
  name: string;
}

export const VOTERS: Voter[] = [
  { id: 'marco', name: 'Marco' },
  { id: 'luis', name: 'Luis' },
  { id: 'andair', name: 'Andair' },
  { id: 'edwin', name: 'Edwin' },
  { id: 'frank', name: 'Frank' },
  { id: 'heder', name: 'Heder' },
  { id: 'jenry', name: 'Jenry' },
  { id: 'marlon', name: 'Marlon' },
];

/**
 * Un voto individual: un votante, un jugador, una posición, un nivel. Es la unidad atómica
 * que se guarda en la base — nunca se lee-modifica-escribe un blob compartido entre
 * jugadores/votantes, así que dos personas votando al mismo tiempo nunca se pisan.
 */
export interface VoteRecord {
  playerId: string;
  voterId: VoterId;
  position: Position;
  level: SkillLevel;
  updatedAt: string;
}

/** Los votos de un votante para un jugador: un nivel (1-6) por posición. */
export type PositionVotes = Partial<Record<Position, SkillLevel>>;

/** Los votos de todos los votantes para un jugador. */
export type VoteMap = Partial<Record<VoterId, PositionVotes>>;

/** Agrupa la lista plana de votos de un jugador en la forma votante → posición → nivel. */
export function buildVoteMap(records: VoteRecord[]): VoteMap {
  const map: VoteMap = {};
  for (const r of records) {
    map[r.voterId] = { ...map[r.voterId], [r.position]: r.level };
  }
  return map;
}

/** Promedio de los votos emitidos para una posición puntual, redondeado 1-6. Null si nadie votó esa posición. */
export function averageVoteForPosition(votes: VoteMap, position: Position): SkillLevel | null {
  const values = Object.values(votes)
    .map((v) => v?.[position])
    .filter((v): v is SkillLevel => typeof v === 'number');
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.min(6, Math.max(1, Math.round(avg))) as SkillLevel;
}

/** Promedios por posición para un jugador, solo con las posiciones que tienen al menos un voto. */
export function averagePositionLevels(votes: VoteMap): Partial<Record<Position, SkillLevel>> {
  const result: Partial<Record<Position, SkillLevel>> = {};
  for (const position of POSITIONS) {
    const avg = averageVoteForPosition(votes, position);
    if (avg !== null) result[position] = avg;
  }
  return result;
}

/** Si un votante calificó las 4 posiciones de un jugador. */
export function hasVotedAllPositions(votes: PositionVotes | undefined): boolean {
  if (!votes) return false;
  return POSITIONS.every((position) => typeof votes[position] === 'number');
}
