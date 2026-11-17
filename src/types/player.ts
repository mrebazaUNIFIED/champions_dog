import type { Position, SkillLevel } from './common';

export interface Player {
  id: string;
  fullName: string;
  photoUrl?: string;
  primaryPosition: Position;
  secondaryPositions: Position[];
  skillLevel: SkillLevel;
  available: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlayerInput = Omit<Player, 'id' | 'createdAt' | 'updatedAt'>;
