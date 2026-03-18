import { supabase } from './supabase';
import { Tournament } from '@/types';

export const tournamentService = {
  // Create tournament
  createTournament: async (
    gameId: string,
    name: string,
    description: string,
    maxParticipants: number,
    userId: string
  ) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        {
          game_id: gameId,
          name,
          description,
          status: 'draft',
          max_participants: maxParticipants,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Tournament;
  },

  // Get user's tournaments
  getUserTournaments: async (userId: string) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, game:games(name)')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get tournament by ID
  getTournamentById: async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, game:games(*), bracket:tournament_brackets(*)')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  },

  // Start tournament
  startTournament: async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        status: 'ongoing',
        start_date: new Date().toISOString(),
      })
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;
    return data as Tournament;
  },

  // Complete tournament
  completeTournament: async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        status: 'completed',
        end_date: new Date().toISOString(),
      })
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;
    return data as Tournament;
  },

  // Get tournament participants
  getTournamentParticipants: async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('tournament_brackets')
      .select('*, match:matches(*, players(user:users(*)))')
      .eq('tournament_id', tournamentId);

    if (error) throw error;
    return data;
  },

  // Subscribe to tournament changes
  subscribeToTournament: (tournamentId: string, callback: (data: any) => void) => {
    const subscription = supabase
      .channel(`tournament:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
