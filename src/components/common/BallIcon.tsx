/** Pelota de fútbol como SVG propio (los sets de íconos de líneas no traen uno). */
export function BallIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.2 15.8 10l-1.45 4.5h-4.7L8.2 10 12 7.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.75v4.45M12 21.25v-2.1M3.4 8.6l4.8 1.4M19.8 15l-4.8-1.4M4.2 15.5l4-2.75M19.8 8.9l-4 2.85M8.95 18.5l1.4-4M14.95 18.4l-1.4-3.9"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
