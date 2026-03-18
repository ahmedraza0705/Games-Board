import { supabase } from './supabase';
import { Match, Player, Score } from '@/types';

export const matchService = {
  // Create a new match
  createMatch: async (gameId: string, matchName: string, userId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          game_id: gameId,
          name: matchName,
          status: 'pending',
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  },

  // Get all matches for a user
  getUserMatches: async (userId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, game:games(*), players:players(*)')
      .or(`created_by.eq.${userId},players.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get match by ID
  getMatchById: async (matchId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, game:games(*), players:players(*, user:users(*)), scores:scores(*)')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data;
  },

  // Start match
  startMatch: async (matchId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  },

  // End match
  endMatch: async (matchId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  },

  // Add player to match
  addPlayerToMatch: async (matchId: string, userId: string) => {
    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          match_id: matchId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Player;
  },

  // Remove player from match
  removePlayerFromMatch: async (playerId: string) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;
  },

  // Record score for player
  recordScore: async (matchId: string, playerId: string, value: number) => {
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          match_id: matchId,
          player_id: playerId,
          value,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Score;
  },

  // Subscribe to match updates (for live scoreboard)
  subscribeToMatch: (matchId: string, callback: (data: any) => void) => {
    const subscription = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `match_id=eq.${matchId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
