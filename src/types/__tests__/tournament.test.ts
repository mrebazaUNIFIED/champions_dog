import { describe, expect, it } from 'vitest';
import { cardTally, computeStandings, matchScore, topScorers, type Match, type TournamentTeam } from '../tournament';

let counter = 0;
function makeTeam(overrides: Partial<TournamentTeam> = {}): TournamentTeam {
  counter += 1;
  const now = new Date().toISOString();
  return {
    id: `t-${counter}`,
    name: `Equipo ${counter}`,
    color: '#16a34a',
    playerIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeMatch(overrides: Partial<Match> & Pick<Match, 'homeTeamId' | 'awayTeamId'>): Match {
  counter += 1;
  const now = new Date().toISOString();
  return {
    id: `m-${counter}`,
    phase: 'Fase 1',
    status: 'scheduled',
    homeLineup: [],
    awayLineup: [],
    events: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('matchScore', () => {
  it('cuenta los goles de cada equipo a partir de los eventos', () => {
    const home = makeTeam();
    const away = makeTeam();
    const match = makeMatch({
      homeTeamId: home.id,
      awayTeamId: away.id,
      events: [
        { id: 'e1', type: 'goal', teamId: home.id, playerId: 'p1', createdAt: '' },
        { id: 'e2', type: 'goal', teamId: home.id, playerId: 'p2', createdAt: '' },
        { id: 'e3', type: 'goal', teamId: away.id, playerId: 'p3', createdAt: '' },
        { id: 'e4', type: 'yellow', teamId: away.id, playerId: 'p3', createdAt: '' },
      ],
    });
    expect(matchScore(match)).toEqual({ home: 2, away: 1 });
  });
});

describe('computeStandings', () => {
  it('solo cuenta partidos finalizados y da 3/1/0 puntos', () => {
    const a = makeTeam();
    const b = makeTeam();
    const c = makeTeam();

    const finished = makeMatch({
      homeTeamId: a.id,
      awayTeamId: b.id,
      status: 'finished',
      events: [
        { id: 'e1', type: 'goal', teamId: a.id, playerId: 'p1', createdAt: '' },
      ],
    });
    const draw = makeMatch({
      homeTeamId: a.id,
      awayTeamId: c.id,
      status: 'finished',
      events: [
        { id: 'e2', type: 'goal', teamId: a.id, playerId: 'p1', createdAt: '' },
        { id: 'e3', type: 'goal', teamId: c.id, playerId: 'p4', createdAt: '' },
      ],
    });
    const notYet = makeMatch({ homeTeamId: b.id, awayTeamId: c.id, status: 'scheduled' });

    const standings = computeStandings([a, b, c], [finished, draw, notYet]);
    const byId = Object.fromEntries(standings.map((s) => [s.teamId, s]));

    expect(byId[a.id]).toMatchObject({ points: 4, played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 2, goalsAgainst: 1 });
    expect(byId[b.id]).toMatchObject({ points: 0, played: 1, won: 0, drawn: 0, lost: 1 });
    expect(byId[c.id]).toMatchObject({ points: 1, played: 1, won: 0, drawn: 1, lost: 0 });
    expect(standings[0].teamId).toBe(a.id);
  });
});

describe('topScorers', () => {
  it('ordena a los jugadores por goles de mayor a menor', () => {
    const home = makeTeam();
    const away = makeTeam();
    const match = makeMatch({
      homeTeamId: home.id,
      awayTeamId: away.id,
      events: [
        { id: 'e1', type: 'goal', teamId: home.id, playerId: 'p1', createdAt: '' },
        { id: 'e2', type: 'goal', teamId: home.id, playerId: 'p1', createdAt: '' },
        { id: 'e3', type: 'goal', teamId: away.id, playerId: 'p2', createdAt: '' },
      ],
    });
    expect(topScorers([match])).toEqual([
      { playerId: 'p1', teamId: home.id, count: 2 },
      { playerId: 'p2', teamId: away.id, count: 1 },
    ]);
  });
});

describe('cardTally', () => {
  it('cuenta amarillas y rojas por jugador', () => {
    const home = makeTeam();
    const away = makeTeam();
    const match = makeMatch({
      homeTeamId: home.id,
      awayTeamId: away.id,
      events: [
        { id: 'e1', type: 'yellow', teamId: home.id, playerId: 'p1', createdAt: '' },
        { id: 'e2', type: 'yellow', teamId: home.id, playerId: 'p1', createdAt: '' },
        { id: 'e3', type: 'red', teamId: away.id, playerId: 'p2', createdAt: '' },
      ],
    });
    const tally = cardTally([match]);
    expect(tally.find((t) => t.playerId === 'p1')).toEqual({ playerId: 'p1', teamId: home.id, yellow: 2, red: 0 });
    expect(tally.find((t) => t.playerId === 'p2')).toEqual({ playerId: 'p2', teamId: away.id, yellow: 0, red: 1 });
  });
});
