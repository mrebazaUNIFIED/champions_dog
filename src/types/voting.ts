import type { SkillLevel } from './common';

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

export type VoteMap = Partial<Record<VoterId, SkillLevel>>;

export interface PlayerVotes {
  playerId: string;
  votes: VoteMap;
  updatedAt: string;
}

/** Promedio de los votos emitidos, redondeado al nivel entero más cercano (1-6). Null si nadie votó. */
export function averageVote(votes: VoteMap): SkillLevel | null {
  const values = Object.values(votes).filter((v): v is SkillLevel => typeof v === 'number');
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.min(6, Math.max(1, Math.round(avg))) as SkillLevel;
}
