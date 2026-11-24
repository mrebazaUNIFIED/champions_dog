import { POSITION_LABELS, type Player, type PlayerInput, type Position, type SkillLevel } from '../../types';

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
    Nivel: p.level,
    Disponible: p.available ? 'Sí' : 'No',
    Observaciones: p.notes ?? '',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 26 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
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
      Nivel: 3,
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

    let level: SkillLevel = 3;
    const rawLevel = row['Nivel'];
    if (rawLevel !== '' && rawLevel !== undefined && rawLevel !== null) {
      const parsed = parseLevel(rawLevel);
      if (!parsed) {
        errors.push(`Fila ${line} (${fullName}): Nivel inválido (debe ser 1 a 6).`);
        return;
      }
      level = parsed;
    }

    const secondaryRaw = String(row['Posiciones secundarias'] ?? '');
    const secondaryPositions = secondaryRaw
      .split(',')
      .map((s) => parsePosition(s))
      .filter((p): p is Position => Boolean(p) && p !== primaryPosition);

    players.push({
      fullName,
      primaryPosition,
      secondaryPositions,
      level,
      available: parseBoolean(row['Disponible']),
      notes: String(row['Observaciones'] ?? '').trim() || undefined,
    });
  });

  return { players, errors };
}
