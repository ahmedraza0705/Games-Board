# Game Scoreboard SaaS Mobile App

A React Native (Expo) mobile application for tracking game scores, managing tournaments, and competing on leaderboards.

## Features

### Core Features
- **User Authentication**: Email/password signup and login with Supabase
- **Dashboard**: View personal stats (games played, win rate, streaks, wins)
- **Match Management**: Create and manage game matches with live scoreboarding
- **Leaderboard**: Global, game-specific, weekly, and monthly leaderboards
- **Match History**: Complete history of all matches with filtering
- **Player Profiles**: View individual player stats and achievements

### Advanced Features
- **Tournaments**: Create and manage tournament brackets
- **Groups/Clubs**: Form groups and view group-specific leaderboards
- **Notifications**: In-app notifications for match invites and tournament updates
- **Admin Dashboard**: Platform statistics and user management (admin only)
- **SaaS Subscriptions**: Free and Pro tiers with tiered features
- **Dark Mode**: Built-in dark theme (default)
- **Real-time Updates**: Supabase Realtime for live score updates

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Icons**: lucide-react-native
- **Storage**: AsyncStorage for local persistence

## Project Structure

```
├── app/                    # Expo Router navigation structure
│   ├── _layout.tsx        # Root layout with auth routing
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   └── (tabs)/            # Main app tabs
│       ├── _layout.tsx    # Bottom tab navigator
│       ├── index.tsx      # Dashboard/Home
│       ├── games.tsx      # Games list and creation
│       ├── leaderboard.tsx # Leaderboards
│       ├── history.tsx    # Match history
│       └── profile.tsx    # User profile
├── services/              # API and business logic
│   ├── supabase.ts       # Supabase client setup
│   ├── matchService.ts   # Match operations
│   └── leaderboardService.ts
├── store/                 # Zustand state management
│   └── authStore.ts      # Authentication state
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
├── constants/             # App constants
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- An existing Supabase project

### Installation

1. **Clone or extract the project**
   ```bash
   cd game-scoreboard-saas
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase Database**

   Run the following SQL in your Supabase SQL editor to create the database schema:

   ```sql
   -- Users table (extends Supabase auth)
   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT NOT NULL,
     full_name TEXT NOT NULL,
     avatar_url TEXT,
     role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
     subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Games table
   CREATE TABLE games (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     icon TEXT,
     max_players INTEGER DEFAULT 10,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Matches table
   CREATE TABLE matches (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     game_id UUID REFERENCES games(id),
     name TEXT NOT NULL,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
     started_at TIMESTAMP,
     ended_at TIMESTAMP,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Players in matches
   CREATE TABLE players (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id),
     position INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Scores
   CREATE TABLE scores (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
     player_id UUID REFERENCES players(id) ON DELETE CASCADE,
     value BIGINT NOT NULL,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Tournaments
   CREATE TABLE tournaments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     game_id UUID REFERENCES games(id),
     name TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed')),
     start_date TIMESTAMP,
     end_date TIMESTAMP,
     max_participants INTEGER,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Groups/Clubs
   CREATE TABLE groups (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     icon TEXT,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Group members
   CREATE TABLE group_members (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Notifications
   CREATE TABLE notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     message TEXT,
     related_id UUID,
     is_read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Leaderboard view (materialized)
   CREATE VIEW leaderboard_view AS
   SELECT 
     u.id as user_id,
     u.full_name,
     u.avatar_url,
     ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(s.value, 0)) DESC) as rank,
     COUNT(DISTINCT m.id) as games_played,
     COUNT(DISTINCT CASE WHEN p.position = 1 THEN m.id END) as wins,
     AVG(p.position) as average_placement,
     CASE WHEN COUNT(DISTINCT m.id) > 0 
       THEN COUNT(DISTINCT CASE WHEN p.position = 1 THEN m.id END)::FLOAT / COUNT(DISTINCT m.id)
       ELSE 0 
     END as win_rate,
     COALESCE(SUM(s.value), 0) as total_points,
     0 as current_streak
   FROM users u
   LEFT JOIN players p ON u.id = p.user_id
   LEFT JOIN matches m ON p.match_id = m.id
   LEFT JOIN scores s ON p.id = s.player_id
   GROUP BY u.id, u.full_name, u.avatar_url;

   -- User stats view
   CREATE VIEW user_stats AS
   SELECT
     u.id as user_id,
     COUNT(DISTINCT m.id) as games_played,
     COUNT(DISTINCT CASE WHEN p.position = 1 THEN m.id END) as total_wins,
     AVG(p.position) as average_placement,
     CASE WHEN COUNT(DISTINCT m.id) > 0
       THEN COUNT(DISTINCT CASE WHEN p.position = 1 THEN m.id END)::FLOAT / COUNT(DISTINCT m.id)
       ELSE 0
     END as win_rate,
     0 as current_streak
   FROM users u
   LEFT JOIN players p ON u.id = p.user_id
   LEFT JOIN matches m ON p.match_id = m.id
   GROUP BY u.id;

   -- Enable RLS on tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE games ENABLE ROW LEVEL SECURITY;
   ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
   ALTER TABLE players ENABLE ROW LEVEL SECURITY;
   ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can view their own data" ON users
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can view public games" ON games
     FOR SELECT USING (true);

   CREATE POLICY "Users can view matches they're in" ON matches
     FOR SELECT USING (created_by = auth.uid() OR id IN (SELECT match_id FROM players WHERE user_id = auth.uid()));

   CREATE POLICY "Users can view scores" ON scores
     FOR SELECT USING (true);

   CREATE POLICY "Users can view notifications" ON notifications
     FOR SELECT USING (user_id = auth.uid());
   ```

5. **Run the app**
   ```bash
   pnpm start
   # or
   npm start
   ```

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web
   - Scan QR code with Expo Go app on device

## Development

### Key Services

**Auth Service** (`store/authStore.ts`)
- Handles user authentication with Supabase
- Manages session persistence with AsyncStorage
- Provides login/signup/logout functionality

**Match Service** (`services/matchService.ts`)
- Create and manage matches
- Add/remove players
- Record scores
- Real-time match subscriptions

**Leaderboard Service** (`services/leaderboardService.ts`)
- Fetch global and game-specific leaderboards
- Time-period filtered leaderboards
- User rank calculations

### Adding New Features

1. **Create new screens** in `app/(tabs)/`
2. **Add new services** in `services/`
3. **Extend types** in `types/index.ts`
4. **Update database schema** in Supabase
5. **Add RLS policies** for data access control

## Next Steps

To complete the full implementation, consider:

1. **Tournaments**: Implement bracket management and tournament matching
2. **Groups**: Build group creation and group-specific leaderboards
3. **Notifications**: Set up push notifications and notification center
4. **Admin Dashboard**: Create admin-only routes and management features
5. **Payments**: Integrate Stripe for subscription management
6. **Analytics**: Add detailed game and player analytics
7. **Social Features**: Add friend lists and match invitations
8. **Images**: Implement avatar uploads and game icons

## Deployment

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

See [Expo Deployment Documentation](https://docs.expo.dev/build/setup/) for detailed instructions.

## License

This project is created as a SaaS mobile application template.

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
