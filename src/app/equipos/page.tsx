'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { TeamBadge } from '../../components/common/TeamBadge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TeamFormModal } from '../../components/teams/TeamFormModal';
import { usePlayersStore } from '../../store/usePlayersStore';
import { useTeamsStore } from '../../store/useTeamsStore';
import type { TournamentTeam } from '../../types';

export default function EquiposPage() {
  const players = usePlayersStore((s) => s.players);
  const loadPlayers = usePlayersStore((s) => s.load);
  const playersLoaded = usePlayersStore((s) => s.loaded);

  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.load);
  const teamsLoaded = useTeamsStore((s) => s.loaded);
  const addTeam = useTeamsStore((s) => s.addTeam);
  const updateTeam = useTeamsStore((s) => s.updateTeam);
  const deleteTeam = useTeamsStore((s) => s.deleteTeam);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TournamentTeam | null>(null);

  useEffect(() => {
    if (!playersLoaded) void loadPlayers();
  }, [playersLoaded, loadPlayers]);

  useEffect(() => {
    if (!teamsLoaded) void loadTeams();
  }, [teamsLoaded, loadTeams]);

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.fullName ?? '—';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Equipos</h2>
          <p className="text-sm text-on-surface-variant">{teams.length} equipos inscritos en el torneo</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Icon name="add" /> Nuevo equipo
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-on-surface-variant">
          <Icon name="shield" className="text-3xl" />
          Todavía no cargaste ningún equipo.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {teams.map((team) => (
            <Card key={team.id} className="group relative flex flex-col items-center gap-2 text-center">
              <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditing(team);
                    setModalOpen(true);
                  }}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  aria-label="Editar"
                >
                  <Icon name="edit" className="text-sm" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar a ${team.name}?`)) void deleteTeam(team.id);
                  }}
                  className="rounded-lg p-1.5 text-secondary-container hover:bg-secondary-container/10"
                  aria-label="Eliminar"
                >
                  <Icon name="delete" className="text-sm" />
                </button>
              </div>
              {team.logoUrl ? (
                <img src={team.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full border border-outline-variant object-cover" />
              ) : (
                <TeamBadge name={team.name} color={team.color} size={64} circle />
              )}
              <p className="w-full truncate font-display text-base leading-tight text-on-surface">{team.name}</p>
              <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Icon name="group" /> {team.playerIds.length} jugadores
              </p>
              {team.playerIds.length > 0 && (
                <p className="line-clamp-2 text-xs text-on-surface-variant">{team.playerIds.map(playerName).join(', ')}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <TeamFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        players={players}
        onSubmit={async (input) => {
          if (editing) await updateTeam(editing.id, input);
          else await addTeam(input);
        }}
      />
    </div>
  );
}
