import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ChevronLeft, Trophy, TrendingUp, Flame, User } from 'lucide-react-native';

interface PlayerProfile {
  id: string;
  full_name: string;
  email: string;
  games_played: number;
  total_wins: number;
  average_placement: number;
  win_rate: number;
  current_streak: number;
}

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { id: playerId } = useLocalSearchParams<{ id: string }>();
  
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);

  useEffect(() => {
    if (playerId) {
      loadPlayerProfile();
    }
  }, [playerId]);

  const loadPlayerProfile = async () => {
    if (!playerId) return;

    try {
      setIsLoading(true);

      // Get player data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', playerId)
        .single();

      if (userError) throw userError;

      // Get player stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', playerId)
        .single();

      const stats = statsData || {
        games_played: 0,
        total_wins: 0,
        average_placement: 0,
        win_rate: 0,
        current_streak: 0,
      };

      setPlayer({
        ...userData,
        ...stats,
      });

      // Get recent matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, game:games(name), players(user_id)')
        .or(`created_by.eq.${playerId},players.user_id.eq.${playerId}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentMatches(matchesData || []);
    } catch (error) {
      console.error('Error loading player profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!player) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white">Player not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView>
        {/* Header */}
        <View className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex-row items-center justify-between pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white flex-1 ml-4">
            Player Profile
          </Text>
        </View>

        {/* Player Card */}
        <View className="px-6 py-8">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
              <User color="white" size={40} />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              {player.full_name}
            </Text>
            <Text className="text-gray-400 mt-1">{player.email}</Text>
          </View>

          {/* Stats Grid */}
          <View className="gap-3 mb-6">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <View className="flex-row items-center gap-2 mb-2">
                  <Trophy color="#F59E0B" size={20} />
                </View>
                <Text className="text-gray-400 text-xs">Games Played</Text>
                <Text className="text-white text-2xl font-bold">
                  {player.games_played}
                </Text>
              </View>

              <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <View className="flex-row items-center gap-2 mb-2">
                  <Trophy color="#10B981" size={20} />
                </View>
                <Text className="text-gray-400 text-xs">Wins</Text>
                <Text className="text-white text-2xl font-bold">
                  {player.total_wins}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp color="#3B82F6" size={20} />
                </View>
                <Text className="text-gray-400 text-xs">Win Rate</Text>
                <Text className="text-white text-2xl font-bold">
                  {(player.win_rate * 100).toFixed(1)}%
                </Text>
              </View>

              <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <View className="flex-row items-center gap-2 mb-2">
                  <Flame color="#EF4444" size={20} />
                </View>
                <Text className="text-gray-400 text-xs">Streak</Text>
                <Text className="text-white text-2xl font-bold">
                  {player.current_streak}
                </Text>
              </View>
            </View>

            <View className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-gray-400 text-xs mb-1">Avg. Placement</Text>
              <Text className="text-white text-2xl font-bold">
                #{player.average_placement?.toFixed(1) || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Recent Matches */}
          <Text className="text-lg font-bold text-white mb-4">Recent Matches</Text>
          {recentMatches.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-6 border border-gray-700 items-center">
              <Text className="text-gray-400">No recent matches</Text>
            </View>
          ) : (
            <View className="space-y-2">
              {recentMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  onPress={() => router.push(`/games/${match.id}`)}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-semibold">
                        {match.game?.name}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        {match.status}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">
                      {new Date(match.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
