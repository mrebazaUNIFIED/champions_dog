'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../../../components/common/Icon';
import { TeamBadge } from '../../../components/common/TeamBadge';
import { formatClock, useMatchClockMs } from '../../../hooks/useMatchClock';
import { repository } from '../../../lib/data';
import { rowToMatch } from '../../../lib/data/supabaseRepository';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase/client';
import { usePlayersStore } from '../../../store/usePlayersStore';
import { useTeamsStore } from '../../../store/useTeamsStore';
import { matchScore, type Match } from '../../../types';

interface GoalToast {
  id: string;
  scorer: string;
  teamName: string;
  color: string;
}

/** Gráfico de marcador y cronómetro para agregar como Browser Source en OBS. Sin header,
 * sin márgenes y con fondo transparente (ver bypass en AppShell.tsx) para componer sobre
 * el video. Lee el partido una vez y después se mantiene al día solo: por Supabase
 * Realtime si está configurado, o por sondeo cada 1s si se corre en modo local (en ese
 * caso solo sincroniza dentro del mismo navegador, ya que OBS corre su propio proceso). */
export default function OverlayPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [match, setMatch] = useState<Match | null>(null);
  const [goalToast, setGoalToast] = useState<GoalToast | null>(null);
  const prevGoalIds = useRef<Set<string> | null>(null);

  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);
  const players = usePlayersStore((s) => s.players);
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);

  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  // El <body> de layout.tsx siempre pinta --color-background; para que OBS componga el
  // overlay sobre el video necesitamos que quede realmente transparente en esta ruta.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.backgroundColor = 'transparent';
    body.style.backgroundColor = 'transparent';
    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void repository.getMatch(matchId).then((m) => {
      if (!cancelled) setMatch(m);
    });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  // Sondeo de base: no depende de que Supabase Realtime esté habilitado para la tabla
  // `matches` (hay que prenderlo a mano en el dashboard, y si no está prendido el
  // overlay se quedaba "mudo" hasta recargar). Es liviano — una consulta por segundo
  // por overlay abierto — y garantiza que esto funcione aunque Realtime no esté armado.
  useEffect(() => {
    const id = setInterval(() => {
      void repository.getMatch(matchId).then(setMatch);
    }, 1000);
    return () => clearInterval(id);
  }, [matchId]);

  // Si Supabase Realtime sí está habilitado para `matches`, esto da updates casi
  // instantáneos en vez de esperar al próximo tick del sondeo de arriba.
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const channel = client
      .channel(`overlay-match-${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => {
          if (payload.new && 'id' in payload.new) {
            setMatch(rowToMatch(payload.new as Parameters<typeof rowToMatch>[0]));
          }
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [matchId]);

  const clockMs = useMatchClockMs(match);

  // Compara los goles del partido contra los de la actualización anterior para mostrar
  // un toast solo con el gol nuevo (no con todo el historial al cargar la página).
  useEffect(() => {
    if (!match) return;
    const goalIds = new Set(match.events.filter((e) => e.type === 'goal').map((e) => e.id));
    const prev = prevGoalIds.current;
    if (prev) {
      const newGoalId = [...goalIds].find((id) => !prev.has(id));
      if (newGoalId) {
        const event = match.events.find((e) => e.id === newGoalId);
        if (event) {
          const scorer = players.find((p) => p.id === event.playerId)?.fullName ?? 'Gol';
          const scoringTeam = teams.find((t) => t.id === event.teamId);
          setGoalToast({ id: newGoalId, scorer, teamName: scoringTeam?.name ?? '', color: scoringTeam?.color ?? '#00f59b' });
        }
      }
    }
    prevGoalIds.current = goalIds;
  }, [match, players, teams]);

  useEffect(() => {
    if (!goalToast) return;
    const t = setTimeout(() => setGoalToast(null), 4000);
    return () => clearTimeout(t);
  }, [goalToast]);

  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  if (!match || !homeTeam || !awayTeam) return null;

  const score = matchScore(match);

  return (
    <div className="flex h-screen w-screen flex-col items-start bg-transparent p-6">
      <div
        className="flex h-16 items-stretch overflow-hidden rounded-lg shadow-2xl"
        style={goalToast ? { boxShadow: `0 0 0 3px ${goalToast.color}99, 0 0 32px ${goalToast.color}66` } : undefined}
      >
        {/* Escudo local: la foto que subieron en Equipos, o el escudo generado si no cargaron una — ocupando
         * todo el espacio del tile. Ancho fijo (no min-w) para que la barra entera tenga un ancho total
         * predecible y nunca se corte en el borde de la pantalla. */}
        <div className="w-16 shrink-0 overflow-hidden bg-surface-container-lowest/95">
          {homeTeam.logoUrl ? (
            <img src={homeTeam.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <TeamBadge name={homeTeam.name} color={homeTeam.color} className="h-full w-full" />
          )}
        </div>

        {/* Franja con el color propio del equipo local (el mismo que eligieron en Equipos). */}
        <div className="flex w-56 shrink-0 items-center justify-center px-4" style={{ backgroundColor: homeTeam.color }}>
          <span className="truncate font-display text-xl font-bold uppercase tracking-wide text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            {homeTeam.name}
          </span>
        </div>

        {/* Marcador + cronómetro, en un panel neutro que separa a los dos equipos. */}
        <div className="flex w-36 shrink-0 flex-col items-center justify-center gap-0.5 bg-surface-container-lowest/95">
          <div className="flex items-center gap-3">
            <motion.span
              key={`home-${score.home}`}
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              className="font-display text-3xl font-bold text-on-surface"
            >
              {score.home}
            </motion.span>
            <span className="font-display text-xl text-on-surface-variant">-</span>
            <motion.span
              key={`away-${score.away}`}
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              className="font-display text-3xl font-bold text-on-surface"
            >
              {score.away}
            </motion.span>
          </div>
          <span className="flex items-center gap-1.5 font-label text-xs text-primary-fixed-dim">
            {match.status === 'live' && match.clockStatus === 'running' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-container opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-container" />
              </span>
            )}
            {formatClock(clockMs)}
          </span>
        </div>

        {/* Franja con el color del equipo visitante. */}
        <div className="flex w-56 shrink-0 items-center justify-center px-4" style={{ backgroundColor: awayTeam.color }}>
          <span className="truncate font-display text-xl font-bold uppercase tracking-wide text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            {awayTeam.name}
          </span>
        </div>

        {/* Escudo visitante, mismo criterio que el local: ocupa todo el tile. */}
        <div className="w-16 shrink-0 overflow-hidden bg-surface-container-lowest/95">
          {awayTeam.logoUrl ? (
            <img src={awayTeam.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <TeamBadge name={awayTeam.name} color={awayTeam.color} className="h-full w-full" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {goalToast && (
          <motion.div
            key={goalToast.id}
            initial={{ opacity: 0, y: -28, scaleY: 0.4 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.6, transition: { duration: 0.25, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            style={{ transformOrigin: 'top center', borderColor: `${goalToast.color}55` }}
            className="relative mt-3 flex items-center gap-3 overflow-hidden rounded-xl border bg-surface-container-lowest/95 py-2.5 pl-3 pr-5 shadow-2xl"
          >
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: goalToast.color }} />
            <motion.span
              initial={{ scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 11 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md"
              style={{ backgroundColor: goalToast.color }}
            >
              <Icon name="sports_soccer" className="text-xl text-white" fill />
            </motion.span>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
            >
              <p className="font-label text-[11px] uppercase tracking-[0.25em]" style={{ color: goalToast.color }}>
                ¡Goooolll!
              </p>
              <p className="font-display text-xl leading-tight text-on-surface">
                {goalToast.scorer}
                {goalToast.teamName && <span className="text-on-surface-variant"> · {goalToast.teamName}</span>}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
