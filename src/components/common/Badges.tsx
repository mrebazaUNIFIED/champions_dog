import { POSITION_LABELS, POSITIONS, SKILL_LABELS, type Position, type SkillLevel } from '../../types';

const POSITION_SHORT: Record<Position, string> = {
  arquero: 'ARQ',
  defensa: 'DEF',
  mediocampista: 'MED',
  delantero: 'DEL',
};

const POSITION_COLORS: Record<Position, string> = {
  arquero: 'bg-gray-100 text-gray-700 border-gray-300',
  defensa: 'bg-green-50 text-green-700 border-green-200',
  mediocampista: 'bg-gray-50 text-gray-600 border-gray-200',
  delantero: 'bg-red-50 text-red-700 border-red-200',
};

export function PositionBadge({ position, className = '' }: { position: Position; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${POSITION_COLORS[position]} ${className}`}>
      {POSITION_LABELS[position]}
    </span>
  );
}

const SKILL_COLORS: Record<SkillLevel, string> = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-green-50 text-green-700 border-green-200',
  3: 'bg-gray-100 text-gray-700 border-gray-300',
  4: 'bg-gray-50 text-gray-600 border-gray-200',
  5: 'bg-red-50 text-red-700 border-red-200',
  6: 'bg-red-100 text-red-800 border-red-300',
};

export function SkillBadge({ level, className = '' }: { level: SkillLevel; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SKILL_COLORS[level]} ${className}`}>
      Nivel {level} · {SKILL_LABELS[level]}
    </span>
  );
}

export function PositionLevelsBadge({
  positionLevels,
  className = '',
}: {
  positionLevels: Record<Position, SkillLevel>;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {POSITIONS.map((position) => (
        <span
          key={position}
          title={POSITION_LABELS[position]}
          className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${SKILL_COLORS[positionLevels[position]]}`}
        >
          {POSITION_SHORT[position]} {positionLevels[position]}
        </span>
      ))}
    </div>
  );
}
