'use client';

import { useEffect } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { usePlayersStore } from '../store/usePlayersStore';

/** Carga jugadores y configuración una sola vez al montar la app. */
export function useBootstrap() {
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);
  const loadConfig = useConfigStore((s) => s.load);
  const configLoaded = useConfigStore((s) => s.loaded);

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  useEffect(() => {
    if (!configLoaded) void loadConfig();
  }, [configLoaded, loadConfig]);
}
