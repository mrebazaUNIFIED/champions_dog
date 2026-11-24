'use client';

import { useEffect } from 'react';
import { usePlayersStore } from '../store/usePlayersStore';

/** Carga los jugadores una sola vez al montar la app. */
export function useBootstrap() {
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);
}
