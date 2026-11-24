'use client';

import { useId } from 'react';

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Escudo vectorial (SVG) con degradé en el color del equipo e iniciales — liviano y nítido a cualquier tamaño. */
export function TeamBadge({
  name,
  color,
  size = 44,
  glow = false,
  className = '',
}: {
  name: string;
  color: string;
  size?: number;
  glow?: boolean;
  className?: string;
}) {
  const gradientId = `badge-${useId()}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 10px ${color}80)` } : undefined}
      aria-label={name}
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="18%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M50 3 L91 17 L91 50 C91 76 73 92 50 97 C27 92 9 76 9 50 L9 17 Z"
        fill={`url(#${gradientId})`}
        stroke="#ffffff"
        strokeOpacity={0.5}
        strokeWidth={2.5}
      />
      <path
        d="M50 3 L91 17 L91 50 C91 76 73 92 50 97"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.9}
        strokeWidth={1.5}
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="34"
        fontWeight={700}
        fill="#ffffff"
        fontFamily="var(--font-chivo), Inter, system-ui, sans-serif"
      >
        {initialsOf(name)}
      </text>
    </svg>
  );
}
