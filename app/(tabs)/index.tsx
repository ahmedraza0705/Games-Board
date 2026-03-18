import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Trophy, Play, TrendingUp, Flame } from 'lucide-react-native';

interface UserStats {
  games_played: number;
  total_wins: number;
  average_placement: number;
  win_rate: number;
  current_streak: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  const loadDashboard = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Load user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStats(statsData);

      // Load recent matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, game:games(name), players(user:users(full_name))')
        .or(`created_by.eq.${user.id},players.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentMatches(matchesData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Header */}
      <View className="bg-gradient-to-b from-gray-800 to-gray-900 px-6 py-8 pt-12">
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </Text>
        <Text className="text-gray-400">
          Keep climbing the leaderboard
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="px-6 py-6">
        <View className="flex-row gap-4 mb-6">
          {/* Games Played */}
          <TouchableOpacity
            className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Play color="#3B82F6" size={20} />
              <Text className="text-gray-400 text-sm">Games Played</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {stats?.games_played || 0}
            </Text>
          </TouchableOpacity>

          {/* Win Rate */}
          <TouchableOpacity
            className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <TrendingUp color="#10B981" size={20} />
              <Text className="text-gray-400 text-sm">Win Rate</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {stats?.win_rate ? `${(stats.win_rate * 100).toFixed(1)}%` : '0%'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-4">
          {/* Total Wins */}
          <TouchableOpacity
            className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Trophy color="#F59E0B" size={20} />
              <Text className="text-gray-400 text-sm">Wins</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {stats?.total_wins || 0}
            </Text>
          </TouchableOpacity>

          {/* Current Streak */}
          <TouchableOpacity
            className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Flame color="#EF4444" size={20} />
              <Text className="text-gray-400 text-sm">Streak</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {stats?.current_streak || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 gap-3 mb-6">
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 items-center flex-row justify-center gap-2"
          onPress={() => router.push('/games')}
        >
          <Play color="white" size={20} />
          <Text className="text-white font-semibold text-base">Create Match</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-800 border border-gray-700 rounded-lg py-4 items-center"
          onPress={() => router.push('/leaderboard')}
        >
          <Text className="text-white font-semibold text-base">View Leaderboard</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Matches */}
      <View className="px-6 pb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-white">Recent Matches</Text>
          {recentMatches.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text className="text-blue-400 text-sm">See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentMatches.length === 0 ? (
          <View className="bg-gray-800 rounded-lg p-6 border border-gray-700 items-center">
            <Text className="text-gray-400 text-center">
              No matches yet. Create your first match to get started!
            </Text>
          </View>
        ) : (
          recentMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700"
              onPress={() => router.push(`/games/${match.id}`)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {match.game?.name || 'Unknown Game'}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {match.status}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-400 text-xs">
                    {new Date(match.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
