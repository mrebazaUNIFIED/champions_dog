/** Íconos de premio en SVG plano (sin degradados): copa con número y medalla con estrella. */

export function TrophyIcon({ place, color, size = 56 }: { place: 1 | 2; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Trofeo ${place}`}>
      <path d="M20 24 Q4 24 7 42 Q10 56 29 53" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d="M80 24 Q96 24 93 42 Q90 56 71 53" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d="M27 18 H73 L68 52 Q50 64 32 52 Z" fill={color} />
      <rect x="45" y="60" width="10" height="15" fill={color} />
      <rect x="32" y="76" width="36" height="9" rx="2" fill={color} />
      <rect x="27" y="87" width="46" height="7" rx="2" fill={color} />
      <text x="50" y="42" textAnchor="middle" fontSize="24" fontWeight="700" fill="#ffffff" fontFamily="var(--font-display)">
        {place}
      </text>
    </svg>
  );
}

export function MedalIcon({ color, size = 56 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Medalla">
      <path d="M37 38 L26 88 L45 76 Z" fill={color} />
      <path d="M63 38 L74 88 L55 76 Z" fill={color} />
      <circle cx="50" cy="40" r="27" fill={color} />
      <circle cx="50" cy="40" r="19" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path
        d="M50 28 L53.2 36.4 L62 36.8 L55 42.3 L57.4 51 L50 45.9 L42.6 51 L45 42.3 L38 36.8 L46.8 36.4 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
