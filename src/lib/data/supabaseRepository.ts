import { supabase } from '../supabase/client';
import type {
  Award,
  ChampionshipConfig,
  HistoryEntry,
  Match,
  MatchEvent,
  Player,
  Position,
  SelectionResult,
  SkillLevel,
  TournamentInfo,
  TournamentTeam,
  VoteRecord,
} from '../../types';
import type { DataRepository } from './repository.types';

interface PlayerRow {
  id: string;
  full_name: string;
  photo_url: string | null;
  primary_position: Position;
  secondary_positions: Position[];
  position_levels: Record<Position, SkillLevel>;
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
    positionLevels: row.position_levels,
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
    position_levels: player.positionLevels,
    available: player.available,
    notes: player.notes ?? null,
    created_at: player.createdAt,
    updated_at: player.updatedAt,
  };
}

const CONFIG_ID = 'singleton';
const SELECTION_ID = 'singleton';
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

  async listVotes(): Promise<VoteRecord[]> {
    const { data, error } = await this.client().from('player_position_votes').select('*');
    if (error) throw error;
    return (data ?? []).map((row) => ({
      playerId: row.player_id as string,
      voterId: row.voter_id as VoteRecord['voterId'],
      position: row.position as Position,
      level: row.level as SkillLevel,
      updatedAt: row.updated_at as string,
    }));
  }

  async upsertVote(record: VoteRecord): Promise<void> {
    const { error } = await this.client()
      .from('player_position_votes')
      .upsert(
        {
          player_id: record.playerId,
          voter_id: record.voterId,
          position: record.position,
          level: record.level,
          updated_at: record.updatedAt,
        },
        { onConflict: 'player_id,voter_id,position' },
      );
    if (error) throw error;
  }

  async applyPositionLevel(playerId: string, position: Position, level: SkillLevel): Promise<void> {
    const { error } = await this.client().rpc('apply_position_level', {
      p_player_id: playerId,
      p_position: position,
      p_level: level,
    });
    if (error) throw error;
  }

  async getConfig(): Promise<ChampionshipConfig | null> {
    const { data, error } = await this.client()
      .from('championship_config')
      .select('data')
      .eq('id', CONFIG_ID)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as ChampionshipConfig) ?? null;
  }

  async saveConfig(config: ChampionshipConfig): Promise<void> {
    const { error } = await this.client()
      .from('championship_config')
      .upsert({ id: CONFIG_ID, data: config, updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  async listHistory(): Promise<HistoryEntry[]> {
    const { data, error } = await this.client()
      .from('history_entries')
      .select('data')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => row.data as HistoryEntry);
  }

  async addHistoryEntry(entry: HistoryEntry): Promise<void> {
    const { error } = await this.client()
      .from('history_entries')
      .insert({ id: entry.id, created_at: entry.createdAt, data: entry });
    if (error) throw error;
  }

  async getCurrentSelection(): Promise<SelectionResult | null> {
    const { data, error } = await this.client()
      .from('current_selection')
      .select('data')
      .eq('id', SELECTION_ID)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as SelectionResult) ?? null;
  }

  async saveCurrentSelection(result: SelectionResult | null): Promise<void> {
    const { error } = await this.client()
      .from('current_selection')
      .upsert({ id: SELECTION_ID, data: result, updated_at: new Date().toISOString() });
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
