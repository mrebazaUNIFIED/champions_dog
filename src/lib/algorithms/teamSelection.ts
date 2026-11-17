import { v4 as uuid } from 'uuid';
import { POSITIONS, type ChampionshipConfig, type Player, type Position, type SelectionResult, type Team } from '../../types';
import { MinCostMaxFlow } from './mcmf';
import { createRng, shuffle } from './random';
import { evaluateBalance, summarize } from './teamScoring';
import { checkFeasibility, computeSlots, isEligible, type ValidationError } from './teamValidation';

export type { ValidationError } from './teamValidation';

interface PositionPools {
  pools: Record<Position, Player[]>;
  unassigned: Player[];
}

/**
 * Resuelve, mediante flujo de costo mínimo (emparejamiento bipartito jugador-posición),
 * qué jugadores cubren cada posición. Entre las posiciones habilitadas de cada jugador
 * (principal o secundaria), prioriza aquella donde está mejor calificado según
 * `positionLevels` (costo = nivel - 1, así nivel 1 "Excelente" es gratis y nivel 6
 * "Principiante" es el más caro) — no la que haya declarado como "principal" si en otra
 * habilitada rindió mejor en la votación. También confirma que existe una asignación
 * simultánea válida: un conteo posición-por-posición puede alcanzar, pero el solapamiento
 * de posiciones secundarias puede impedir cubrir todas las plazas a la vez; este algoritmo
 * lo detecta con certeza.
 */
function solvePositionPools(players: Player[], config: ChampionshipConfig): PositionPools | ValidationError {
  const quick = checkFeasibility(players, config.formation, config.numberOfTeams);
  if (!quick.ok) return quick;

  const available = players.filter((p) => p.available);
  const slots = computeSlots(config.formation, config.numberOfTeams);

  const n = available.length;
  const positionIndex: Record<Position, number> = {} as Record<Position, number>;
  POSITIONS.forEach((p, i) => (positionIndex[p] = n + 1 + i));
  const source = 0;
  const sink = n + 1 + POSITIONS.length;
  const nodeCount = sink + 1;

  const mcmf = new MinCostMaxFlow(nodeCount);
  available.forEach((_, i) => mcmf.addEdge(source, i + 1, 1, 0));
  available.forEach((player, i) => {
    for (const position of POSITIONS) {
      if (!isEligible(player, position)) continue;
      const cost = player.positionLevels[position] - 1;
      mcmf.addEdge(i + 1, positionIndex[position], 1, cost);
    }
  });
  for (const position of POSITIONS) {
    mcmf.addEdge(positionIndex[position], sink, slots[position], 0);
  }

  const totalNeeded = Object.values(slots).reduce((a, b) => a + b, 0);
  const { flow } = mcmf.run(source, sink);

  if (flow < totalNeeded) {
    return {
      ok: false,
      message:
        'No existe una asignación posible: el solapamiento de posiciones secundarias impide cubrir todas las plazas simultáneamente.',
      shortages: [],
      totalNeeded,
      totalAvailable: available.length,
    };
  }

  const pools: Record<Position, Player[]> = { arquero: [], defensa: [], mediocampista: [], delantero: [] };
  const assignedIds = new Set<string>();

  available.forEach((player, i) => {
    for (const position of POSITIONS) {
      if (!isEligible(player, position)) continue;
      const f = mcmf.flowOn(i + 1, positionIndex[position]);
      if (f > 0) {
        pools[position].push(player);
        assignedIds.add(player.id);
      }
    }
  });

  const unassigned = available.filter((p) => !assignedIds.has(p.id));
  return { pools, unassigned };
}

/**
 * Construcción inicial: "draft serpiente" por posición. Dentro de cada posición ordena
 * a los jugadores por puntaje (mejor primero) y los reparte en rondas 1→6, 6→1, 1→6...
 * entre los 6 equipos. Es el método estándar para repartir un pool clasificado de forma
 * pareja entre varios equipos y evita que un mismo equipo se quede con los mejores de una posición.
 */
function draftDistribute(
  pools: Record<Position, Player[]>,
  config: ChampionshipConfig,
  rng: () => number,
): Team[] {
  const teams: Team[] = config.teamDefaults.map((def) => ({
    id: uuid(),
    name: def.name,
    color: def.color,
    players: [],
  }));

  for (const position of POSITIONS) {
    const rounds = config.formation[position];
    const ranked = shuffle(pools[position], rng).sort(
      (a, b) => config.scoring[b.positionLevels[position]] - config.scoring[a.positionLevels[position]],
    );

    let cursor = 0;
    for (let round = 0; round < rounds; round++) {
      const order = round % 2 === 0 ? [...teams.keys()] : [...teams.keys()].reverse();
      for (const teamIdx of order) {
        const player = ranked[cursor++];
        teams[teamIdx].players.push({
          player,
          assignedPosition: position,
          score: config.scoring[player.positionLevels[position]],
        });
      }
    }
  }

  return teams;
}

function cloneTeams(teams: Team[]): Team[] {
  return teams.map((t) => ({ ...t, players: t.players.map((p) => ({ ...p })) }));
}

/**
 * Búsqueda local (recocido simulado): intenta intercambiar dos jugadores entre equipos
 * y acepta el cambio si mejora el equilibrio general; también acepta, con probabilidad
 * decreciente, cambios que empeoran momentáneamente para escapar de óptimos locales.
 * Un intercambio solo se realiza si ambos jugadores quedan habilitados para la posición
 * que ocuparían (igual o mediante posición secundaria), así nunca se rompe la formación.
 */
function localSearchOptimize(
  initialTeams: Team[],
  config: ChampionshipConfig,
  iterations: number,
  rng: () => number,
): Team[] {
  let current = cloneTeams(initialTeams);
  let currentObjective = evaluateBalance(current);
  let best = cloneTeams(current);
  let bestObjective = currentObjective;

  const initialTemp = Math.max(currentObjective * 0.5, 1);

  for (let iter = 0; iter < iterations; iter++) {
    const temp = initialTemp * (1 - iter / iterations);

    const teamsCount = current.length;
    const ta = Math.floor(rng() * teamsCount);
    let tb = Math.floor(rng() * teamsCount);
    if (tb === ta) tb = (tb + 1) % teamsCount;

    const teamA = current[ta];
    const teamB = current[tb];
    if (teamA.players.length === 0 || teamB.players.length === 0) continue;

    const ia = Math.floor(rng() * teamA.players.length);
    const ib = Math.floor(rng() * teamB.players.length);
    const assignedA = teamA.players[ia];
    const assignedB = teamB.players[ib];

    const newPosForA = assignedB.assignedPosition;
    const newPosForB = assignedA.assignedPosition;
    if (!isEligible(assignedA.player, newPosForA) || !isEligible(assignedB.player, newPosForB)) continue;

    const swappedA = {
      player: assignedB.player,
      assignedPosition: newPosForA,
      score: config.scoring[assignedB.player.positionLevels[newPosForA]],
    };
    const swappedB = {
      player: assignedA.player,
      assignedPosition: newPosForB,
      score: config.scoring[assignedA.player.positionLevels[newPosForB]],
    };

    const trial = cloneTeams(current);
    trial[ta].players[ia] = swappedA;
    trial[tb].players[ib] = swappedB;

    const trialObjective = evaluateBalance(trial);
    const delta = trialObjective - currentObjective;

    if (delta < 0 || rng() < Math.exp(-delta / Math.max(temp, 1e-6))) {
      current = trial;
      currentObjective = trialObjective;
      if (currentObjective < bestObjective) {
        best = cloneTeams(current);
        bestObjective = currentObjective;
      }
    }
  }

  return best;
}

function buildResult(teams: Team[], unassignedPlayers: Player[]): SelectionResult {
  const { stats, maxDiff, strongestTeamId, weakestTeamId } = summarize(teams);
  return {
    teams,
    stats,
    unassignedPlayers,
    maxDiff,
    strongestTeamId,
    weakestTeamId,
    generatedAt: new Date().toISOString(),
  };
}

export interface GenerateOptions {
  attempts?: number;
  iterationsPerAttempt?: number;
  seed?: number;
}

/**
 * Motor principal de selección. Corre varios intentos independientes (construcción +
 * búsqueda local, cada uno con un orden aleatorio distinto) y se queda con el que logre
 * el mejor equilibrio general, es decir, busca combinaciones alternativas y elige la mejor.
 */
export function generateTeamSelection(
  players: Player[],
  config: ChampionshipConfig,
  options: GenerateOptions = {},
): SelectionResult | ValidationError {
  const { attempts = 8, iterationsPerAttempt = 2500, seed = Date.now() } = options;

  const poolsOrError = solvePositionPools(players, config);
  if ('ok' in poolsOrError) return poolsOrError;
  const { pools: positionPools, unassigned } = poolsOrError;

  let bestTeams: Team[] | null = null;
  let bestObjective = Infinity;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const rng = createRng(seed + attempt * 7919);
    const drafted = draftDistribute(positionPools, config, rng);
    const optimized = localSearchOptimize(drafted, config, iterationsPerAttempt, rng);
    const objective = evaluateBalance(optimized);
    if (objective < bestObjective) {
      bestObjective = objective;
      bestTeams = optimized;
    }
  }

  return buildResult(bestTeams as Team[], unassigned);
}

/**
 * Genera varias propuestas de selección independientes (requerimiento: "permitir generar
 * distintas propuestas"), ordenadas de mejor a peor equilibrio, para que el usuario elija
 * cuál conservar antes de guardarla.
 */
export function generateProposals(
  players: Player[],
  config: ChampionshipConfig,
  count = 3,
  options: Omit<GenerateOptions, 'seed'> = {},
): SelectionResult[] | ValidationError {
  const results: SelectionResult[] = [];
  const base = Date.now();

  for (let i = 0; i < count; i++) {
    const result = generateTeamSelection(players, config, { ...options, seed: base + i * 104729 });
    if ('ok' in result) return result;
    results.push(result);
  }

  return results.sort((a, b) => a.maxDiff - b.maxDiff);
}
