import { supabase } from '../supabase/client';
import type { Award, Match, MatchEvent, MatchStage, Player, Position, SkillLevel, TournamentInfo, TournamentTeam } from '../../types';
import type { DataRepository } from './repository.types';

interface PlayerRow {
  id: string;
  full_name: string;
  photo_url: string | null;
  primary_position: Position;
  secondary_positions: Position[];
  level: SkillLevel;
  available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    fullName: row.full_name,
    photoUrl: row.photo_url ?? undefined,
    primaryPosition: row.primary_position,
    secondaryPositions: row.secondary_positions ?? [],
    level: row.level,
    available: row.available,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function playerToRow(player: Player): PlayerRow {
  return {
    id: player.id,
    full_name: player.fullName,
    photo_url: player.photoUrl ?? null,
    primary_position: player.primaryPosition,
    secondary_positions: player.secondaryPositions,
    level: player.level,
    available: player.available,
    notes: player.notes ?? null,
    created_at: player.createdAt,
    updated_at: player.updatedAt,
  };
}

const TOURNAMENT_INFO_ID = 'singleton';

interface TeamRow {
  id: string;
  name: string;
  color: string;
  logo_url: string | null;
  player_ids: string[];
  created_at: string;
  updated_at: string;
}

function rowToTeam(row: TeamRow): TournamentTeam {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    logoUrl: row.logo_url ?? undefined,
    playerIds: row.player_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function teamToRow(team: TournamentTeam): TeamRow {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    logo_url: team.logoUrl ?? null,
    player_ids: team.playerIds,
    created_at: team.createdAt,
    updated_at: team.updatedAt,
  };
}

interface MatchRow {
  id: string;
  stage: MatchStage;
  phase: string;
  home_team_id: string;
  away_team_id: string;
  status: Match['status'];
  scheduled_at: string | null;
  home_lineup: string[];
  away_lineup: string[];
  events: MatchEvent[];
  created_at: string;
  updated_at: string;
}

function rowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    stage: row.stage,
    phase: row.phase,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    status: row.status,
    scheduledAt: row.scheduled_at ?? undefined,
    homeLineup: row.home_lineup ?? [],
    awayLineup: row.away_lineup ?? [],
    events: row.events ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matchToRow(match: Match): MatchRow {
  return {
    id: match.id,
    stage: match.stage,
    phase: match.phase,
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    status: match.status,
    scheduled_at: match.scheduledAt ?? null,
    home_lineup: match.homeLineup,
    away_lineup: match.awayLineup,
    events: match.events,
    created_at: match.createdAt,
    updated_at: match.updatedAt,
  };
}

interface AwardRow {
  id: string;
  title: string;
  winner_player_id: string | null;
  winner_name: string | null;
  note: string | null;
  created_at: string;
}

function rowToAward(row: AwardRow): Award {
  return {
    id: row.id,
    title: row.title,
    winnerPlayerId: row.winner_player_id ?? undefined,
    winnerName: row.winner_name ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function awardToRow(award: Award): AwardRow {
  return {
    id: award.id,
    title: award.title,
    winner_player_id: award.winnerPlayerId ?? null,
    winner_name: award.winnerName ?? null,
    note: award.note ?? null,
    created_at: award.createdAt,
  };
}

export class SupabaseRepository implements DataRepository {
  readonly backend = 'supabase' as const;

  private client() {
    if (!supabase) throw new Error('Supabase no está configurado.');
    return supabase;
  }

  async listPlayers(): Promise<Player[]> {
    const { data, error } = await this.client().from('players').select('*').order('created_at');
    if (error) throw error;
    return (data as PlayerRow[]).map(rowToPlayer);
  }

  async upsertPlayer(player: Player): Promise<void> {
    const { error } = await this.client().from('players').upsert(playerToRow(player));
    if (error) throw error;
  }

  async upsertPlayers(players: Player[]): Promise<void> {
    if (players.length === 0) return;
    const { error } = await this.client()
      .from('players')
      .upsert(players.map(playerToRow));
    if (error) throw error;
  }

  async deletePlayer(id: string): Promise<void> {
    const { error } = await this.client().from('players').delete().eq('id', id);
    if (error) throw error;
  }

  async listTeams(): Promise<TournamentTeam[]> {
    const { data, error } = await this.client().from('teams').select('*').order('created_at');
    if (error) throw error;
    return (data as TeamRow[]).map(rowToTeam);
  }

  async upsertTeam(team: TournamentTeam): Promise<void> {
    const { error } = await this.client().from('teams').upsert(teamToRow(team));
    if (error) throw error;
  }

  async deleteTeam(id: string): Promise<void> {
    const { error } = await this.client().from('teams').delete().eq('id', id);
    if (error) throw error;
  }

  async listMatches(): Promise<Match[]> {
    const { data, error } = await this.client().from('matches').select('*').order('created_at');
    if (error) throw error;
    return (data as MatchRow[]).map(rowToMatch);
  }

  async upsertMatch(match: Match): Promise<void> {
    const { error } = await this.client().from('matches').upsert(matchToRow(match));
    if (error) throw error;
  }

  async deleteMatch(id: string): Promise<void> {
    const { error } = await this.client().from('matches').delete().eq('id', id);
    if (error) throw error;
  }

  async listAwards(): Promise<Award[]> {
    const { data, error } = await this.client().from('awards').select('*').order('created_at');
    if (error) throw error;
    return (data as AwardRow[]).map(rowToAward);
  }

  async upsertAward(award: Award): Promise<void> {
    const { error } = await this.client().from('awards').upsert(awardToRow(award));
    if (error) throw error;
  }

  async deleteAward(id: string): Promise<void> {
    const { error } = await this.client().from('awards').delete().eq('id', id);
    if (error) throw error;
  }

  async getTournamentInfo(): Promise<TournamentInfo | null> {
    const { data, error } = await this.client()
      .from('tournament_info')
      .select('data')
      .eq('id', TOURNAMENT_INFO_ID)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as TournamentInfo) ?? null;
  }

  async saveTournamentInfo(info: TournamentInfo): Promise<void> {
    const { error } = await this.client()
      .from('tournament_info')
      .upsert({ id: TOURNAMENT_INFO_ID, data: info, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}
