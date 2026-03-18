import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Trophy, TrendingUp, Flame, Medal } from 'lucide-react-native';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardScreen() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);

      // Build query based on period
      let query = supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100);

      if (selectedPeriod !== 'all') {
        const days = selectedPeriod === 'week' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal color="#F59E0B" size={20} />;
      case 2:
        return <Medal color="#9CA3AF" size={20} />;
      case 3:
        return <Medal color="#CD7F32" size={20} />;
      default:
        return null;
    }
  };

  const renderLeaderboardItem = (item: LeaderboardEntry, index: number) => {
    const isCurrentUser = item.user_id === user?.id;
    
    return (
      <View
        key={`${item.user_id}-${index}`}
        className={`flex-row items-center gap-4 px-6 py-4 border-b border-gray-700 ${
          isCurrentUser ? 'bg-blue-900 bg-opacity-30' : 'bg-transparent'
        }`}
      >
        {/* Rank */}
        <View className="w-10 items-center">
          {item.rank <= 3 ? (
            getMedalIcon(item.rank)
          ) : (
            <Text className="text-gray-400 font-semibold text-lg">
              #{item.rank}
            </Text>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className={`font-semibold ${
            isCurrentUser ? 'text-blue-400' : 'text-white'
          }`}>
            {item.full_name}
          </Text>
          <View className="flex-row gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <Trophy color="#F59E0B" size={12} />
              <Text className="text-gray-400 text-xs">
                {item.games_played} games
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <TrendingUp color="#10B981" size={12} />
              <Text className="text-gray-400 text-xs">
                {(item.win_rate * 100).toFixed(0)}% win
              </Text>
            </View>
          </View>
        </View>

        {/* Points */}
        <View className="items-end">
          <Text className="text-white font-bold text-lg">
            {item.total_points}
          </Text>
          <Text className="text-gray-400 text-xs">points</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
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
          <View className="flex-row items-center gap-2 mb-2">
            <Trophy color="#F59E0B" size={32} />
            <Text className="text-3xl font-bold text-white">Leaderboard</Text>
          </View>
          <Text className="text-gray-400">
            {selectedPeriod === 'all'
              ? 'All time rankings'
              : `Last ${selectedPeriod === 'week' ? '7 days' : '30 days'}`}
          </Text>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-2 px-6 py-4 border-b border-gray-700">
          {(['all', 'month', 'week'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              className={`flex-1 rounded-lg py-2 items-center ${
                selectedPeriod === period
                  ? 'bg-blue-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                className={`font-semibold text-sm ${
                  selectedPeriod === period ? 'text-white' : 'text-gray-400'
                }`}
              >
                {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leaderboard List */}
        {leaderboard.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Trophy color="#6B7280" size={48} />
            <Text className="text-gray-400 mt-4">No scores yet</Text>
          </View>
        ) : (
          leaderboard.map((item, index) =>
            renderLeaderboardItem(item, index)
          )
        )}
      </ScrollView>
    </View>
  );
}
