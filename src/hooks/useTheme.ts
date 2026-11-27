'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'pdl.theme';

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme: Theme) {
  if (theme === 'light') document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
}

/** Tema oscuro por defecto; "claro" se guarda en localStorage y se aplica vía
 * `data-theme` en <html> (ver el script inline en layout.tsx que evita el flash). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // modo privado u otro bloqueo de storage: el toggle sigue funcionando para esta sesión.
      }
      return next;
    });
  }

  return { theme, toggleTheme };
}
