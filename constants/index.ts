// Subscription features
export const SUBSCRIPTION_FEATURES = {
  free: {
    max_matches_per_month: 20,
    tournaments_limit: 1,
    groups_limit: 2,
    custom_games: false,
    analytics: false,
  },
  pro: {
    max_matches_per_month: -1, // unlimited
    tournaments_limit: -1,
    groups_limit: -1,
    custom_games: true,
    analytics: true,
  },
};

// Match statuses
export const MATCH_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  MATCH_INVITATION: 'match_invitation',
  TOURNAMENT_UPDATE: 'tournament_update',
  GROUP_ACTIVITY: 'group_activity',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
} as const;

// Colors
export const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#111827',
  darkSecondary: '#1F2937',
  darkTertiary: '#374151',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// API endpoints (if using custom backend)
export const API_ENDPOINTS = {
  USERS: '/api/users',
  MATCHES: '/api/matches',
  LEADERBOARD: '/api/leaderboard',
  NOTIFICATIONS: '/api/notifications',
} as const;
