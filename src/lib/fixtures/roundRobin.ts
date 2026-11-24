export interface RoundRobinFixture {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
}

const BYE = '__bye__';

/**
 * Todos-contra-todos (método del círculo): cada equipo juega una vez contra cada uno de
 * los demás, repartido en rondas parejas (equipos.length - 1 rondas si la cantidad es par).
 * Si la cantidad es impar, se agrega un "bye" y la ronda de ese equipo queda sin partido.
 */
export function generateRoundRobinFixture(teamIds: string[]): RoundRobinFixture[] {
  if (teamIds.length < 2) return [];

  const ids = [...teamIds];
  if (ids.length % 2 !== 0) ids.push(BYE);

  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const arr = [...ids];
  const fixtures: RoundRobinFixture[] = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a === BYE || b === BYE) continue;
      const [homeTeamId, awayTeamId] = round % 2 === 0 ? [a, b] : [b, a];
      fixtures.push({ round: round + 1, homeTeamId, awayTeamId });
    }
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as string);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  return fixtures;
}
