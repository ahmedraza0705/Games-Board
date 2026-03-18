import { supabase } from './supabase';

export const adminService = {
  // Get platform statistics
  getPlatformStats: async () => {
    try {
      const { data: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

      const { data: totalMatches } = await supabase
        .from('matches')
        .select('id', { count: 'exact' });

      const { data: completedMatches } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .eq('status', 'completed');

      const { data: totalGames } = await supabase
        .from('games')
        .select('id', { count: 'exact' });

      const { data: proUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('subscription_tier', 'pro');

      return {
        total_users: totalUsers?.length || 0,
        total_matches: totalMatches?.length || 0,
        completed_matches: completedMatches?.length || 0,
        total_games: totalGames?.length || 0,
        pro_users: proUsers?.length || 0,
        free_users: (totalUsers?.length || 0) - (proUsers?.length || 0),
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return {
        total_users: 0,
        total_matches: 0,
        completed_matches: 0,
        total_games: 0,
        pro_users: 0,
        free_users: 0,
      };
    }
  },

  // Get all users with filtering
  getAllUsers: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Update user subscription tier
  updateUserSubscription: async (userId: string, tier: 'free' | 'pro') => {
    const { data, error } = await supabase
      .from('users')
      .update({ subscription_tier: tier })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user role
  updateUserRole: async (userId: string, role: 'user' | 'admin' | 'super_admin') => {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all matches with filtering
  getAllMatches: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, game:games(name), created_by_user:users(full_name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Delete match (admin only)
  deleteMatch: async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) throw error;
  },

  // Get all games
  getAllGames: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('games')
      .select('*, created_by_user:users(full_name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Delete game (admin only)
  deleteGame: async (gameId: string) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);

    if (error) throw error;
  },

  // Get suspicious activity (potential abuse)
  getSuspiciousActivity: async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, players(count), scores(count)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Filter for suspicious patterns (e.g., matches with no players, extreme scores)
    return (data || []).filter((match: any) => {
      const playerCount = match.players?.[0]?.count || 0;
      const scoreCount = match.scores?.[0]?.count || 0;
      return playerCount === 0 || (playerCount > 0 && scoreCount === 0);
    });
  },

  // Get user activity summary
  getUserActivity: async (userId: string) => {
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, created_at, status')
      .or(`created_by.eq.${userId},players.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (matchesError) throw matchesError;

    return {
      total_matches: matches?.length || 0,
      last_activity: matches?.[0]?.created_at,
    };
  },

  // Get revenue insights (if using Stripe)
  getRevenueInsights: async () => {
    try {
      const { data: proUsers } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('subscription_tier', 'pro');

      const monthlyRecurringRevenue = (proUsers?.length || 0) * 9.99; // Example: $9.99/month

      return {
        active_pro_users: proUsers?.length || 0,
        monthly_recurring_revenue: monthlyRecurringRevenue,
        monthly_recurring_revenue_formatted: `$${monthlyRecurringRevenue.toFixed(2)}`,
      };
    } catch (error) {
      console.error('Error getting revenue insights:', error);
      return {
        active_pro_users: 0,
        monthly_recurring_revenue: 0,
        monthly_recurring_revenue_formatted: '$0.00',
      };
    }
  },
};
