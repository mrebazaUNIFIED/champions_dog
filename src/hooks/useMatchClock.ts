'use client';

import { useEffect, useState } from 'react';
import { matchClockMs, type Match } from '../types';

/** mm:ss (o h:mm:ss pasada la hora) para mostrar en el panel de control y el overlay. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Milisegundos del cronómetro del partido, refrescados cada segundo mientras está corriendo. */
export function useMatchClockMs(match: Pick<Match, 'clockStatus' | 'clockStartedAt' | 'clockElapsedMs'> | null | undefined): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (match?.clockStatus !== 'running') return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [match?.clockStatus]);

  if (!match) return 0;
  return matchClockMs(match);
}
