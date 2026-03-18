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
import { Calendar, Users, Trophy, Clock } from 'lucide-react-native';

interface MatchRecord {
  id: string;
  game: { name: string };
  status: string;
  created_at: string;
  player_count: number;
  user_position?: number;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    loadHistory();
  }, [user?.id, filter]);

  const loadHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      let query = supabase
        .from('matches')
        .select('id, game:games(name), status, created_at, players(count)')
        .or(`created_by.eq.${user.id},players.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMatches(
        (data || []).map((match: any) => ({
          ...match,
          player_count: match.players?.length || 0,
        }))
      );
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-200';
      case 'in_progress':
        return 'bg-blue-900 text-blue-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
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
            <Calendar color="#3B82F6" size={32} />
            <Text className="text-3xl font-bold text-white">Match History</Text>
          </View>
          <Text className="text-gray-400">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </Text>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 px-6 py-4 border-b border-gray-700">
          {(['all', 'completed', 'in_progress'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              className={`px-4 py-2 rounded-lg ${
                filter === filterType
                  ? 'bg-blue-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}
              onPress={() => setFilter(filterType)}
            >
              <Text
                className={`font-semibold text-sm ${
                  filter === filterType ? 'text-white' : 'text-gray-400'
                }`}
              >
                {filterType === 'all'
                  ? 'All'
                  : filterType === 'completed'
                    ? 'Completed'
                    : 'In Progress'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Matches List */}
        <View className="px-6 py-6">
          {matches.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 border border-gray-700 items-center">
              <Calendar color="#6B7280" size={48} />
              <Text className="text-white font-semibold mt-4 text-lg">
                No matches yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {filter === 'all'
                  ? 'Start playing to build your match history'
                  : `No ${filter === 'completed' ? 'completed' : 'in-progress'} matches`}
              </Text>
            </View>
          ) : (
            matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700"
                onPress={() => router.push(`/games/${match.id}`)}
              >
                {/* Game Name and Status */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">
                      {match.game?.name || 'Unknown Game'}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1 ${getStatusColor(
                      match.status
                    )}`}
                  >
                    <Text className="text-xs font-semibold capitalize">
                      {match.status}
                    </Text>
                  </View>
                </View>

                {/* Match Details */}
                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1">
                    <Clock color="#9CA3AF" size={14} />
                    <Text className="text-gray-400 text-sm">
                      {formatDate(match.created_at)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Users color="#9CA3AF" size={14} />
                    <Text className="text-gray-400 text-sm">
                      {match.player_count} player{match.player_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
