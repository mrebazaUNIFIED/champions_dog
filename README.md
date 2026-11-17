# 4.º Campeonato Perritos Locos — Selección de Equipos

Aplicación web para administrar jugadores y generar automáticamente 6 equipos equilibrados,
respetando posiciones obligatorias, niveles de habilidad y la formación configurada.

## Stack

- **Next.js (App Router)** + TypeScript, 100% client-side (sin backend propio, sin Python, sin Express).
- **Tailwind CSS v4**.
- **Supabase** (`@supabase/supabase-js`) para persistencia — con fallback automático a `localStorage`
  mientras no haya credenciales configuradas (ver abajo).
- **Recharts** para los gráficos comparativos, **react-icons** para la iconografía.
- Motor de selección de equipos propio, en TypeScript puro (sin OR-Tools ni servicios externos):
  flujo de costo mínimo para resolver posiciones + draft balanceado + recocido simulado para
  equilibrar puntajes. Ver `src/lib/algorithms/`.

## Scripts

```bash
npm run dev     # servidor de desarrollo (http://localhost:3000)
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # eslint
npm run test    # tests unitarios del motor de selección (vitest)
```

## Persistencia: local vs Supabase

La app funciona completa sin ninguna configuración: mientras no existan las variables de entorno
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, todos los datos (jugadores,
configuración, selección actual, historial) se guardan en `localStorage` del navegador.

Para conectar Supabase más adelante, sin cambiar nada de código:

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Corré, en orden, los scripts del SQL editor de tu proyecto:
   - `supabase/migrations/0001_init.sql` — tablas de jugadores, configuración, historial y selección actual.
   - `supabase/migrations/0002_storage.sql` — bucket público `player-photos` para las fotos de jugadores.
3. Copiá `.env.example` a `.env.local` y completá la URL y la clave **anon/pública** (nunca la
   service role) de tu proyecto.
4. Reiniciá `npm run dev` — la app empieza a usar Supabase (datos y fotos) automáticamente.

La pantalla "Configuración" del menú muestra en todo momento si estás en modo local o conectado a
Supabase.

## Estructura

```
src/
  app/                   # rutas (App Router): dashboard, jugadores, campeonato, seleccion,
                          # comparacion, historial, configuracion
  components/
    layout/              # sidebar, topbar, shell
    common/               # Button, Card, Modal, badges
    players/             # formulario de jugadores
    teams/                # tarjeta de equipo (vista + edición manual)
  lib/
    algorithms/           # motor de selección (teamSelection, teamScoring, teamValidation, mcmf)
    data/                 # repositorio de datos (local / Supabase) con la misma interfaz
    supabase/              # cliente de Supabase
    export/                # exportación a Excel, PDF e imagen
  store/                  # estado global (Zustand): jugadores, configuración, selección, historial
  types/                  # tipos de dominio (player, team, config, history)
supabase/migrations/      # esquema SQL para Supabase
```

## Motor de selección de equipos

Reglas obligatorias que el motor nunca rompe:

- Siempre genera exactamente 6 equipos.
- Cada equipo respeta la formación configurada (por defecto: 1 arquero, 2 defensas,
  1 mediocampista, 2 delanteros).
- Ningún jugador se asigna a más de un equipo ni a más de una posición.
- Se prioriza la posición principal de cada jugador; las posiciones secundarias solo se usan
  cuando hace falta para completar las plazas.
- Si no hay jugadores suficientes para cubrir las posiciones obligatorias, no genera nada y
  explica exactamente qué falta.

Dentro de esas reglas, optimiza el equilibrio entre equipos (puntaje total, nivel por posición,
que ningún equipo concentre a los mejores) probando varias combinaciones y devolviendo la mejor
(ver `generateTeamSelection` / `generateProposals` en `src/lib/algorithms/teamSelection.ts`).
