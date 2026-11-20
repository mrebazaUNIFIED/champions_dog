'use client';

import { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiShield, FiTrash2, FiUsers } from 'react-icons/fi';
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
          <h2 className="font-display text-2xl font-bold text-ink-900">Equipos</h2>
          <p className="text-sm text-ink-500">{teams.length} equipos inscritos en el torneo</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <FiPlus /> Nuevo equipo
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-ink-400">
          <FiShield className="text-3xl" />
          Todavía no cargaste ningún equipo.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full border border-surface-200 object-cover" />
                ) : (
                  <TeamBadge name={team.name} color={team.color} size={48} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight text-ink-900">{team.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-400">
                    <FiUsers /> {team.playerIds.length} jugadores
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditing(team);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-ink-500 hover:bg-surface-100 hover:text-ink-900"
                    aria-label="Editar"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${team.name}?`)) void deleteTeam(team.id);
                    }}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              {team.playerIds.length > 0 && (
                <p className="text-xs text-ink-500">{team.playerIds.map(playerName).join(', ')}</p>
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
