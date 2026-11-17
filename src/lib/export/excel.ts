import {
  defaultPositionLevels,
  POSITION_LABELS,
  POSITIONS,
  type Player,
  type PlayerInput,
  type Position,
  type SelectionResult,
  type SkillLevel,
} from '../../types';

// xlsx y file-saver se cargan solo cuando realmente se exporta/importa algo,
// para no sumarlas al bundle inicial de las páginas que usan este módulo.
async function loadXlsx() {
  return import('xlsx');
}

async function loadSaveAs() {
  return (await import('file-saver')).saveAs;
}

const POSITION_BY_LABEL: Record<string, Position> = {
  arquero: 'arquero',
  defensa: 'defensa',
  mediocampista: 'mediocampista',
  delantero: 'delantero',
};

const LEVEL_COLUMN: Record<Position, string> = {
  arquero: 'Nivel Arquero',
  defensa: 'Nivel Defensa',
  mediocampista: 'Nivel Medio',
  delantero: 'Nivel Delantero',
};

function parsePosition(value: unknown): Position | null {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return POSITION_BY_LABEL[normalized] ?? null;
}

function parseLevel(value: unknown): SkillLevel | null {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 6) return n as SkillLevel;
  return null;
}

function parseBoolean(value: unknown, fallback = true): boolean {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (['si', 'sí', 'true', '1', 'disponible'].includes(normalized)) return true;
  if (['no', 'false', '0', 'no disponible'].includes(normalized)) return false;
  return fallback;
}

export async function exportPlayersToExcel(players: Player[], filename = 'jugadores_perritos_locos.xlsx') {
  const [XLSX, saveAs] = await Promise.all([loadXlsx(), loadSaveAs()]);

  const rows = players.map((p) => ({
    'Nombre completo': p.fullName,
    'Posición principal': POSITION_LABELS[p.primaryPosition],
    'Posiciones secundarias': p.secondaryPositions.map((pos) => POSITION_LABELS[pos]).join(', '),
    [LEVEL_COLUMN.arquero]: p.positionLevels.arquero,
    [LEVEL_COLUMN.defensa]: p.positionLevels.defensa,
    [LEVEL_COLUMN.mediocampista]: p.positionLevels.mediocampista,
    [LEVEL_COLUMN.delantero]: p.positionLevels.delantero,
    Disponible: p.available ? 'Sí' : 'No',
    Observaciones: p.notes ?? '',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 26 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Jugadores');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export async function downloadPlayersTemplate() {
  const [XLSX, saveAs] = await Promise.all([loadXlsx(), loadSaveAs()]);

  const sheet = XLSX.utils.json_to_sheet([
    {
      'Nombre completo': 'Juan Pérez',
      'Posición principal': 'Defensa',
      'Posiciones secundarias': 'Mediocampista',
      [LEVEL_COLUMN.arquero]: 6,
      [LEVEL_COLUMN.defensa]: 3,
      [LEVEL_COLUMN.mediocampista]: 4,
      [LEVEL_COLUMN.delantero]: 5,
      Disponible: 'Sí',
      Observaciones: '',
    },
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Jugadores');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'plantilla_jugadores.xlsx');
}

export interface ImportResult {
  players: PlayerInput[];
  errors: string[];
}

export async function parsePlayersExcel(file: File): Promise<ImportResult> {
  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });

  const players: PlayerInput[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const line = index + 2; // +1 por encabezado, +1 por índice base 1
    const fullName = String(row['Nombre completo'] ?? '').trim();
    if (!fullName) {
      errors.push(`Fila ${line}: falta el nombre completo.`);
      return;
    }

    const primaryPosition = parsePosition(row['Posición principal']);
    if (!primaryPosition) {
      errors.push(`Fila ${line} (${fullName}): posición principal inválida.`);
      return;
    }

    const positionLevels = defaultPositionLevels(3);
    let levelsOk = true;
    for (const position of POSITIONS) {
      const raw = row[LEVEL_COLUMN[position]];
      if (raw === '' || raw === undefined || raw === null) continue;
      const level = parseLevel(raw);
      if (!level) {
        errors.push(`Fila ${line} (${fullName}): ${LEVEL_COLUMN[position]} inválido (debe ser 1 a 6).`);
        levelsOk = false;
        break;
      }
      positionLevels[position] = level;
    }
    if (!levelsOk) return;

    const secondaryRaw = String(row['Posiciones secundarias'] ?? '');
    const secondaryPositions = secondaryRaw
      .split(',')
      .map((s) => parsePosition(s))
      .filter((p): p is Position => Boolean(p) && p !== primaryPosition);

    players.push({
      fullName,
      primaryPosition,
      secondaryPositions,
      positionLevels,
      available: parseBoolean(row['Disponible']),
      notes: String(row['Observaciones'] ?? '').trim() || undefined,
    });
  });

  return { players, errors };
}

export async function exportSelectionToExcel(result: SelectionResult, filename = 'equipos_perritos_locos.xlsx') {
  const [XLSX, saveAs] = await Promise.all([loadXlsx(), loadSaveAs()]);
  const workbook = XLSX.utils.book_new();

  const summary = result.stats.map((s) => {
    const team = result.teams.find((t) => t.id === s.teamId);
    return {
      Equipo: team?.name ?? '',
      'Puntaje total': s.totalScore,
      Promedio: Number(s.averageScore.toFixed(2)),
      Arqueros: s.positionCounts.arquero,
      Defensas: s.positionCounts.defensa,
      Mediocampistas: s.positionCounts.mediocampista,
      Delanteros: s.positionCounts.delantero,
    };
  });
  const summarySheet = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  result.teams.forEach((team) => {
    const rows = team.players.map((p) => ({
      Jugador: p.player.fullName,
      Posición: POSITION_LABELS[p.assignedPosition],
      Nivel: p.player.positionLevels[p.assignedPosition],
      Puntos: p.score,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, team.name.slice(0, 31));
  });

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}
