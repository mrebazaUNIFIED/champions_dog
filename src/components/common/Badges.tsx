import { MATCH_STATUS_LABELS, POSITION_LABELS, SKILL_LABELS, type MatchStatus, type Position, type SkillLevel } from '../../types';

const POSITION_COLORS: Record<Position, string> = {
  arquero: 'bg-surface-container-highest text-on-surface-variant border-white/10',
  defensa: 'bg-primary-container/15 text-primary-fixed-dim border-primary-container/25',
  mediocampista: 'bg-surface-container text-on-surface-variant border-white/10',
  delantero: 'bg-secondary-container/15 text-secondary-fixed border-secondary-container/25',
};

export function PositionBadge({ position, className = '' }: { position: Position; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-label text-[11px] ${POSITION_COLORS[position]} ${className}`}>
      {POSITION_LABELS[position]}
    </span>
  );
}

const SKILL_COLORS: Record<SkillLevel, string> = {
  1: 'bg-primary-container/25 text-primary-fixed-dim border-primary-container/35',
  2: 'bg-primary-container/10 text-primary-fixed-dim border-primary-container/20',
  3: 'bg-surface-container-highest text-on-surface-variant border-white/10',
  4: 'bg-surface-container text-on-surface-variant border-white/10',
  5: 'bg-secondary-container/10 text-secondary-fixed border-secondary-container/20',
  6: 'bg-secondary-container/25 text-secondary-fixed border-secondary-container/35',
};

export function SkillBadge({ level, className = '' }: { level: SkillLevel; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-label text-[11px] ${SKILL_COLORS[level]} ${className}`}>
      Nivel {level} · {SKILL_LABELS[level]}
    </span>
  );
}

export function MatchStatusBadge({ status, className = '' }: { status: MatchStatus; className?: string }) {
  if (status === 'live') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-primary-container/15 px-2.5 py-0.5 font-label text-[11px] text-primary-fixed-dim ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-container opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-container" />
        </span>
        {MATCH_STATUS_LABELS.live}
      </span>
    );
  }
  if (status === 'finished') {
    return (
      <span className={`inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-0.5 font-label text-[11px] text-on-surface-variant ${className}`}>
        {MATCH_STATUS_LABELS.finished}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 font-label text-[11px] text-on-surface-variant ${className}`}>
      {MATCH_STATUS_LABELS.scheduled}
    </span>
  );
}
