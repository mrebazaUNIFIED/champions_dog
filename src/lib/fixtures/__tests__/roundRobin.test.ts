import { describe, expect, it } from 'vitest';
import { generateRoundRobinFixture } from '../roundRobin';

describe('generateRoundRobinFixture', () => {
  it('genera 15 partidos en 5 fechas para 6 equipos, cada par una sola vez', () => {
    const teams = ['a', 'b', 'c', 'd', 'e', 'f'];
    const fixtures = generateRoundRobinFixture(teams);

    expect(fixtures).toHaveLength(15);
    expect(new Set(fixtures.map((f) => f.round)).size).toBe(5);
    for (let round = 1; round <= 5; round++) {
      expect(fixtures.filter((f) => f.round === round)).toHaveLength(3);
    }

    const pairs = new Set(fixtures.map((f) => [f.homeTeamId, f.awayTeamId].sort().join('-')));
    expect(pairs.size).toBe(15);

    for (const a of teams) {
      for (const b of teams) {
        if (a === b) continue;
        const played = fixtures.some(
          (f) => (f.homeTeamId === a && f.awayTeamId === b) || (f.homeTeamId === b && f.awayTeamId === a),
        );
        expect(played).toBe(true);
      }
    }
  });

  it('agrega un bye para cantidad impar de equipos', () => {
    const teams = ['a', 'b', 'c'];
    const fixtures = generateRoundRobinFixture(teams);
    expect(fixtures).toHaveLength(3);
    for (const round of new Set(fixtures.map((f) => f.round))) {
      expect(fixtures.filter((f) => f.round === round)).toHaveLength(1);
    }
  });
});
