import { describe, expect, it } from 'vitest';
import { defaultChampionshipConfig } from '../../../types/config';
import { defaultPositionLevels, type Player, type Position, type SkillLevel } from '../../../types';
import { generateProposals, generateTeamSelection } from '../teamSelection';
import { isEligible } from '../teamValidation';

let counter = 0;
function makePlayer(overrides: Partial<Omit<Player, 'positionLevels'>> & { primaryPosition: Position; level?: SkillLevel }): Player {
  counter += 1;
  const now = new Date().toISOString();
  const { level = 3, ...rest } = overrides;
  return {
    id: `p-${counter}`,
    fullName: `Jugador ${counter}`,
    secondaryPositions: [],
    positionLevels: defaultPositionLevels(level),
    available: true,
    createdAt: now,
    updatedAt: now,
    ...rest,
  };
}

function buildExactPool(): Player[] {
  const levels: SkillLevel[] = [1, 2, 3, 4, 5];
  const pool: Player[] = [];
  const counts: Record<Position, number> = { arquero: 6, defensa: 12, mediocampista: 6, delantero: 12 };
  (Object.keys(counts) as Position[]).forEach((position) => {
    for (let i = 0; i < counts[position]; i++) {
      pool.push(makePlayer({ primaryPosition: position, level: levels[i % levels.length] }));
    }
  });
  return pool;
}

describe('generateTeamSelection', () => {
  it('genera exactamente 6 equipos que cumplen la formación configurada', () => {
    const config = defaultChampionshipConfig();
    const players = buildExactPool();
    const result = generateTeamSelection(players, config, { attempts: 3, iterationsPerAttempt: 500 });

    if ('ok' in result) throw new Error(`No debería fallar: ${result.message}`);

    expect(result.teams).toHaveLength(6);
    for (const team of result.teams) {
      expect(team.players).toHaveLength(6);
      const byPosition: Record<Position, number> = { arquero: 0, defensa: 0, mediocampista: 0, delantero: 0 };
      for (const assigned of team.players) byPosition[assigned.assignedPosition] += 1;
      expect(byPosition).toEqual(config.formation);
    }
  });

  it('nunca asigna a un jugador a más de un equipo', () => {
    const config = defaultChampionshipConfig();
    const players = buildExactPool();
    const result = generateTeamSelection(players, config, { attempts: 3, iterationsPerAttempt: 500 });
    if ('ok' in result) throw new Error(`No debería fallar: ${result.message}`);

    const seen = new Set<string>();
    for (const team of result.teams) {
      for (const assigned of team.players) {
        expect(seen.has(assigned.player.id)).toBe(false);
        seen.add(assigned.player.id);
      }
    }
  });

  it('solo asigna jugadores a posiciones para las que están habilitados', () => {
    const config = defaultChampionshipConfig();
    const players = buildExactPool();
    const result = generateTeamSelection(players, config, { attempts: 3, iterationsPerAttempt: 500 });
    if ('ok' in result) throw new Error(`No debería fallar: ${result.message}`);

    for (const team of result.teams) {
      for (const assigned of team.players) {
        expect(isEligible(assigned.player, assigned.assignedPosition)).toBe(true);
      }
    }
  });

  it('usa posiciones secundarias cuando faltan jugadores en la posición principal', () => {
    const config = defaultChampionshipConfig();
    // Solo 4 arqueros puros (faltan 2), pero 2 defensas también saben atajar.
    const players: Player[] = [
      ...Array.from({ length: 4 }, () => makePlayer({ primaryPosition: 'arquero' })),
      ...Array.from({ length: 12 }, () => makePlayer({ primaryPosition: 'defensa' })),
      makePlayer({ primaryPosition: 'defensa', secondaryPositions: ['arquero'] }),
      makePlayer({ primaryPosition: 'defensa', secondaryPositions: ['arquero'] }),
      ...Array.from({ length: 6 }, () => makePlayer({ primaryPosition: 'mediocampista' })),
      ...Array.from({ length: 12 }, () => makePlayer({ primaryPosition: 'delantero' })),
    ];

    const result = generateTeamSelection(players, config, { attempts: 3, iterationsPerAttempt: 500 });
    if ('ok' in result) throw new Error(`No debería fallar: ${result.message}`);
    expect(result.teams).toHaveLength(6);
    for (const team of result.teams) {
      expect(team.players.filter((p) => p.assignedPosition === 'arquero')).toHaveLength(1);
    }
  });

  it('ubica a un jugador en su posición secundaria si rinde mejor ahí que en la principal', () => {
    const config = defaultChampionshipConfig();
    config.numberOfTeams = 1;
    config.formation = { arquero: 0, defensa: 1, mediocampista: 1, delantero: 0 };
    config.teamDefaults = [config.teamDefaults[0]];

    // X declara defensa como principal pero es mucho mejor mediocampista.
    const x = makePlayer({ primaryPosition: 'defensa', secondaryPositions: ['mediocampista'] });
    x.positionLevels.defensa = 5;
    x.positionLevels.mediocampista = 1;
    // Y solo juega de defensa, y ahí es excelente.
    const y = makePlayer({ primaryPosition: 'defensa' });
    y.positionLevels.defensa = 1;
    // Z solo juega de mediocampista, y ahí es malo.
    const z = makePlayer({ primaryPosition: 'mediocampista' });
    z.positionLevels.mediocampista = 6;

    const result = generateTeamSelection([x, y, z], config, { attempts: 1, iterationsPerAttempt: 50 });
    if ('ok' in result) throw new Error(`No debería fallar: ${result.message}`);

    const assignedByPosition = Object.fromEntries(result.teams[0].players.map((p) => [p.assignedPosition, p.player.id]));
    expect(assignedByPosition.mediocampista).toBe(x.id);
    expect(assignedByPosition.defensa).toBe(y.id);
    expect(result.unassignedPlayers.map((p) => p.id)).toEqual([z.id]);
  });

  it('devuelve un error de validación claro si faltan jugadores para cubrir las posiciones', () => {
    const config = defaultChampionshipConfig();
    const players = Array.from({ length: 3 }, () => makePlayer({ primaryPosition: 'arquero' }));
    const result = generateTeamSelection(players, config, { attempts: 1, iterationsPerAttempt: 10 });

    expect('ok' in result).toBe(true);
    if ('ok' in result) {
      expect(result.ok).toBe(false);
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it('genera varias propuestas alternativas ordenadas de mejor a peor equilibrio', () => {
    const config = defaultChampionshipConfig();
    const players = buildExactPool();
    const proposals = generateProposals(players, config, 3, { attempts: 2, iterationsPerAttempt: 300 });

    if ('ok' in proposals) throw new Error(`No debería fallar: ${proposals.message}`);
    expect(proposals).toHaveLength(3);
    for (let i = 1; i < proposals.length; i++) {
      expect(proposals[i].maxDiff).toBeGreaterThanOrEqual(proposals[i - 1].maxDiff);
    }
  });
});
