import { POSITION_LABELS, SKILL_LABELS, type Position, type SkillLevel } from '../../types';

const POSITION_COLORS: Record<Position, string> = {
  arquero: 'bg-amber-50 text-amber-700 border-amber-200',
  defensa: 'bg-sky-50 text-sky-700 border-sky-200',
  mediocampista: 'bg-violet-50 text-violet-700 border-violet-200',
  delantero: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function PositionBadge({ position, className = '' }: { position: Position; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${POSITION_COLORS[position]} ${className}`}>
      {POSITION_LABELS[position]}
    </span>
  );
}

const SKILL_COLORS: Record<SkillLevel, string> = {
  1: 'bg-green-50 text-green-700 border-green-200',
  2: 'bg-sky-50 text-sky-700 border-sky-200',
  3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  4: 'bg-orange-50 text-orange-700 border-orange-200',
  5: 'bg-red-50 text-red-700 border-red-200',
  6: 'bg-surface-100 text-ink-500 border-surface-200',
};

export function SkillBadge({ level, className = '' }: { level: SkillLevel; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SKILL_COLORS[level]} ${className}`}>
      Nivel {level} · {SKILL_LABELS[level]}
    </span>
  );
}
