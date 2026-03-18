// User and Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super_admin';
  subscription_tier: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Game Types
export interface Game {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  max_players: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Match Types
export interface Match {
  id: string;
  game_id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at?: string;
  ended_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  user_id: string;
  match_id: string;
  position?: number;
  created_at: string;
}

export interface Score {
  id: string;
  match_id: string;
  player_id: string;
  value: number;
  timestamp: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  rank: number;
  games_played: number;
  wins: number;
  placements: number[];
  win_rate: number;
  current_streak: number;
  total_points: number;
}

// Tournament Types
export interface Tournament {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'ongoing' | 'completed';
  start_date: string;
  end_date?: string;
  max_participants: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentBracket {
  id: string;
  tournament_id: string;
  round: number;
  match_id: string;
  position: number;
  created_at: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'match_invitation' | 'tournament_update' | 'group_activity' | 'achievement' | 'system';
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// Subscription Types
export interface Subscription {
  tier: 'free' | 'pro';
  features: {
    max_matches_per_month: number;
    tournaments_limit: number;
    groups_limit: number;
    custom_games: boolean;
    analytics: boolean;
  };
}

// Stats Types
export interface UserStats {
  games_played: number;
  total_wins: number;
  average_placement: number;
  win_rate: number;
  current_streak: number;
  favorite_game?: Game;
  recent_matches: Match[];
}
