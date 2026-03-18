import { supabase } from './supabase';
import { LeaderboardEntry } from '@/types';

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (gameId?: string, limit = 100) => {
    let query = supabase
      .from('leaderboard_view')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as LeaderboardEntry[];
  },

  // Get game-specific leaderboard
  getGameLeaderboard: async (gameId: string, limit = 100) => {
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .eq('game_id', gameId)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as LeaderboardEntry[];
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async (gameId?: string, limit = 100) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    let query = supabase
      .from('matches')
      .select('players(*), scores(*)')
      .gte('created_at', weekAgo.toISOString())
      .order('total_points', { ascending: false });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    return data;
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async (gameId?: string, limit = 100) => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let query = supabase
      .from('matches')
      .select('players(*), scores(*)')
      .gte('created_at', monthAgo.toISOString())
      .order('total_points', { ascending: false });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    return data;
  },

  // Get user rank for a game
  getUserRank: async (userId: string, gameId?: string) => {
    let query = supabase
      .from('leaderboard_view')
      .select('rank, total_points, win_rate')
      .eq('user_id', userId);

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  },

  // Get friends leaderboard
  getFriendsLeaderboard: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .eq('user_id', userId)
      .limit(limit);

    if (error) throw error;
    return data as LeaderboardEntry[];
  },

  // Subscribe to leaderboard changes
  subscribeToLeaderboard: (gameId: string | null, callback: (data: any) => void) => {
    const table = 'leaderboard_view';
    const subscription = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(gameId && { filter: `game_id=eq.${gameId}` }),
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
