import { POSITIONS, type Formation, type Player, type Position } from '../../types';

export interface Shortage {
  position: Position;
  needed: number;
  eligibleAvailable: number;
}

export interface ValidationError {
  ok: false;
  message: string;
  shortages: Shortage[];
  totalNeeded: number;
  totalAvailable: number;
}

export type ValidationOk = { ok: true; totalNeeded: number; totalAvailable: number };

export function isEligible(player: Player, position: Position): boolean {
  return player.primaryPosition === position || player.secondaryPositions.includes(position);
}

export function computeSlots(formation: Formation, numberOfTeams: number): Record<Position, number> {
  const slots = {} as Record<Position, number>;
  for (const p of POSITIONS) slots[p] = formation[p] * numberOfTeams;
  return slots;
}

/**
 * Restricciones obligatorias (hard constraints):
 * - Debe haber suficientes jugadores disponibles en total.
 * - Debe haber suficientes jugadores habilitados (posición principal o secundaria) por posición.
 * Esta es una condición necesaria rápida; `solvePositionPools` en teamSelection.ts confirma
 * con un algoritmo de emparejamiento que además existe una asignación simultánea válida
 * (el solapamiento de posiciones secundarias puede volver infactible un caso que pase este chequeo).
 */
export function checkFeasibility(
  players: Player[],
  formation: Formation,
  numberOfTeams: number,
): ValidationOk | ValidationError {
  const available = players.filter((p) => p.available);
  const slots = computeSlots(formation, numberOfTeams);
  const totalNeeded = Object.values(slots).reduce((a, b) => a + b, 0);

  const shortages: Shortage[] = [];
  for (const position of POSITIONS) {
    const eligibleAvailable = available.filter((pl) => isEligible(pl, position)).length;
    if (eligibleAvailable < slots[position]) {
      shortages.push({ position, needed: slots[position], eligibleAvailable });
    }
  }

  if (available.length < totalNeeded) {
    return {
      ok: false,
      message: `Se necesitan ${totalNeeded} jugadores disponibles y solo hay ${available.length}.`,
      shortages,
      totalNeeded,
      totalAvailable: available.length,
    };
  }

  if (shortages.length > 0) {
    return {
      ok: false,
      message: 'No hay suficientes jugadores habilitados para cubrir alguna posición obligatoria.',
      shortages,
      totalNeeded,
      totalAvailable: available.length,
    };
  }

  return { ok: true, totalNeeded, totalAvailable: available.length };
}

/** Valida que un intercambio manual de dos jugadores entre equipos no rompa ninguna condición obligatoria. */
export function canAssignPosition(player: Player, position: Position): boolean {
  return isEligible(player, position);
}
