# Game Scoreboard SaaS - Setup Guide

Complete guide to set up and run the Game Scoreboard SaaS mobile application.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm/pnpm**: Package manager
- **Expo CLI**: `npm install -g expo-cli`
- **Supabase Project**: Create one at [supabase.com](https://supabase.com)
- **Mobile Device/Emulator**: For testing the app

## Step 1: Install Dependencies

```bash
cd game-scoreboard-saas
pnpm install
# or
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to initialize
4. Go to **Settings** > **API** and copy:
   - Project URL (EXPO_PUBLIC_SUPABASE_URL)
   - Anon Key (EXPO_PUBLIC_SUPABASE_ANON_KEY)

### 2.2 Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `scripts/001_init_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for the schema to be created

You should see:
- 9 new tables created
- Views created
- Triggers and functions created
- RLS policies enabled

## Step 3: Configure App Metadata

Edit `app.json` to customize your app:

```json
{
  "expo": {
    "name": "Game Scoreboard",      // Your app name
    "slug": "game-scoreboard",       // URL-friendly name
    "version": "1.0.0",              // App version
    "owner": "your-expo-username",   // Your Expo username
    // ... other config
  }
}
```

## Step 4: Start the Development Server

```bash
pnpm start
# or
npm start
```

This will show a menu:
- Press **i** to open iOS simulator (macOS only)
- Press **a** to open Android emulator
- Press **w** to open web browser
- Scan **QR code** with Expo Go app on physical device

## Step 5: Test the App

### Create Test Account
1. On login screen, click "Sign Up"
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
3. Click "Create Account"

### Test Core Features
- Dashboard shows stats (all zeros initially)
- Games: Create a new game
- Leaderboard: View empty leaderboard
- History: No matches yet
- Profile: View your profile

## Deployment

### iOS Deployment

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Build for iOS:
   ```bash
   eas build --platform ios
   ```

3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Android Deployment

1. Build for Android:
   ```bash
   eas build --platform android
   ```

2. Submit to Google Play:
   ```bash
   eas submit --platform android
   ```

See [Expo Deployment Docs](https://docs.expo.dev/build/setup/) for detailed instructions.

## Key Features Implemented

### Authentication
- Email/password signup and login
- Session persistence with AsyncStorage
- User role management (user, admin, super_admin)

### Core Features
- Dashboard with user statistics
- Match creation and management
- Live scoreboarding with Realtime updates
- Player profiles
- Match history with filtering

### Leaderboards
- Global leaderboard
- Game-specific leaderboards
- Time-period filters (all-time, monthly, weekly)
- User rankings and statistics

### Advanced Features
- Notification center
- Tournament support (services ready)
- Group/Club system (services ready)
- Admin dashboard with platform statistics
- Subscription tiers (Free vs Pro)

## Directory Structure

```
game-scoreboard-saas/
├── app/                          # Expo Router app structure
│   ├── _layout.tsx              # Root navigation
│   ├── auth/                    # Auth screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── index.tsx            # Dashboard
│   │   ├── games.tsx            # Games list
│   │   ├── leaderboard.tsx      # Leaderboard
│   │   ├── history.tsx          # Match history
│   │   └── profile.tsx          # User profile
│   ├── games/                   # Game-specific screens
│   │   ├── [id].tsx             # Match detail/scoreboard
│   │   └── create-match.tsx     # Create match
│   ├── players/                 # Player profiles
│   │   └── [id].tsx
│   ├── admin/                   # Admin screens
│   │   └── dashboard.tsx
│   └── notifications.tsx        # Notification center
├── services/                     # Business logic & API
│   ├── supabase.ts              # Supabase client
│   ├── matchService.ts          # Match operations
│   ├── leaderboardService.ts    # Leaderboard queries
│   ├── tournamentService.ts     # Tournament management
│   ├── groupService.ts          # Group management
│   ├── notificationService.ts   # Notifications
│   └── adminService.ts          # Admin operations
├── store/                        # State management
│   └── authStore.ts             # Zustand auth store
├── types/                        # TypeScript types
│   └── index.ts
├── utils/                        # Utility functions
│   ├── validation.ts            # Input validation
│   ├── date.ts                  # Date formatting
│   └── errors.ts                # Error handling
├── constants/                    # App constants
│   └── index.ts
├── scripts/                      # Database migrations
│   └── 001_init_schema.sql
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Documentation
```

## Troubleshooting

### Common Issues

**"Supabase credentials are missing"**
- Make sure `.env.local` exists and has the correct values
- Expo doesn't reload environment variables automatically
- Restart the dev server: Stop (Ctrl+C) and run `pnpm start` again

**"Authentication fails with 'Invalid login credentials'"**
- Make sure your Supabase auth is enabled
- Check that the user exists in your database
- Verify email/password are correct

**"Database queries return empty results"**
- Make sure the SQL migration script was run successfully
- Check that RLS policies aren't blocking queries
- Verify the logged-in user ID matches the data owner

**"Emulator won't connect to Supabase"**
- Make sure your Supabase URL is public (not localhost)
- Check CORS settings in Supabase
- Try using `http://localhost:19000` for Expo Metro debugging

**"NativeWind styles not applied"**
- Clear Metro cache: `npx expo start --clear`
- Rebuild the app
- Make sure you're using `className` not `style`

### Debug Mode

Add console logging in `store/authStore.ts` and services:

```typescript
console.log("[v0] Loading data:", { user, isLoading });
```

Watch the console output for debugging.

## Next Steps

1. **Customize Branding**
   - Update app name in `app.json`
   - Add your logo/icons to `assets/`
   - Customize colors in `constants/index.ts`

2. **Add Payment Integration**
   - Integrate Stripe for Pro plan payments
   - Update `SUBSCRIPTION_FEATURES` in constants
   - Create Stripe checkout flow

3. **Enable Push Notifications**
   - Install `expo-notifications`
   - Set up notification handlers
   - Implement push notification service

4. **Add Analytics**
   - Integrate Sentry for error tracking
   - Add PostHog or Amplitude for usage analytics

5. **Production Checklist**
   - Set up CI/CD pipeline
   - Configure code signing for iOS/Android
   - Set up automated testing
   - Create privacy policy and terms of service

## Support

- **Expo Documentation**: https://docs.expo.dev/
- **Supabase Documentation**: https://supabase.com/docs
- **React Native Documentation**: https://reactnative.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/

## License

This project is provided as a SaaS mobile application template.
