import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { matchService } from '@/services/matchService';
import {
  ChevronLeft,
  Play,
  CheckCircle,
  Users,
  Trophy,
  Plus,
  MoreVertical,
} from 'lucide-react-native';
import { Match, Player } from '@/types';

interface MatchData extends Match {
  game: any;
  players: (Player & { user: any; scores: any[] })[];
}

export default function MatchDetailScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id: matchId } = useLocalSearchParams<{ id: string }>();

  const [match, setMatch] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadMatch();

    // Subscribe to match updates
    if (matchId) {
      const subscription = matchService.subscribeToMatch(matchId, (data) => {
        loadMatch();
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [matchId]);

  const loadMatch = async () => {
    if (!matchId) return;

    try {
      setIsLoading(true);
      const matchData = await matchService.getMatchById(matchId);
      setMatch(matchData);
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMatch = async () => {
    if (!match) return;

    try {
      setIsUpdating(true);
      const updated = await matchService.startMatch(match.id);
      setMatch({ ...match, status: updated.status, started_at: updated.started_at });
    } catch (error) {
      Alert.alert('Error', 'Failed to start match');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEndMatch = async () => {
    if (!match) return;

    Alert.alert('End Match', 'Are you sure you want to end this match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Match',
        onPress: async () => {
          try {
            setIsUpdating(true);
            const updated = await matchService.endMatch(match.id);
            setMatch({ ...match, status: updated.status, ended_at: updated.ended_at });
          } catch (error) {
            Alert.alert('Error', 'Failed to end match');
          } finally {
            setIsUpdating(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAddScore = async () => {
    if (!match || !selectedPlayerId || !scoreValue) return;

    try {
      setIsUpdating(true);
      const value = parseInt(scoreValue);
      await matchService.recordScore(match.id, selectedPlayerId, value);
      setScoreValue('');
      setShowScoreModal(false);
      await loadMatch();
    } catch (error) {
      Alert.alert('Error', 'Failed to record score');
    } finally {
      setIsUpdating(false);
    }
  };

  const canEditMatch = user?.id === match?.created_by;

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!match) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white">Match not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex-row items-center justify-between pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-bold text-white">{match.game?.name}</Text>
          <Text className="text-gray-400 text-sm">{match.name}</Text>
        </View>
        {canEditMatch && (
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <MoreVertical color="white" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1">
        {/* Match Status */}
        <View className="px-6 py-4 border-b border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400">Status</Text>
            <View
              className={`rounded-full px-3 py-1 ${
                match.status === 'completed'
                  ? 'bg-green-900'
                  : match.status === 'in_progress'
                    ? 'bg-blue-900'
                    : 'bg-yellow-900'
              }`}
            >
              <Text
                className={`font-semibold text-sm capitalize ${
                  match.status === 'completed'
                    ? 'text-green-200'
                    : match.status === 'in_progress'
                      ? 'text-blue-200'
                      : 'text-yellow-200'
                }`}
              >
                {match.status}
              </Text>
            </View>
          </View>

          {match.status !== 'completed' && canEditMatch && (
            <View className="flex-row gap-2 mt-4">
              {match.status === 'pending' && (
                <TouchableOpacity
                  className="flex-1 bg-blue-600 rounded-lg py-2 flex-row items-center justify-center gap-2"
                  onPress={handleStartMatch}
                  disabled={isUpdating}
                >
                  <Play color="white" size={16} />
                  <Text className="text-white font-semibold">Start Match</Text>
                </TouchableOpacity>
              )}

              {match.status === 'in_progress' && (
                <TouchableOpacity
                  className="flex-1 bg-red-600 rounded-lg py-2 flex-row items-center justify-center gap-2"
                  onPress={handleEndMatch}
                  disabled={isUpdating}
                >
                  <CheckCircle color="white" size={16} />
                  <Text className="text-white font-semibold">End Match</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Players/Scoreboard */}
        <View className="px-6 py-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Users color="#3B82F6" size={20} />
            <Text className="text-lg font-bold text-white">
              Players ({match.players?.length || 0})
            </Text>
          </View>

          <View className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {match.players?.map((player, index) => {
              const totalScore = player.scores?.reduce(
                (sum: number, s: any) => sum + s.value,
                0
              ) || 0;

              return (
                <View
                  key={player.id}
                  className={`p-4 ${
                    index !== (match.players?.length || 0) - 1
                      ? 'border-b border-gray-700'
                      : ''
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        {player.user?.full_name}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {player.user?.email}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <Trophy color="#F59E0B" size={16} />
                        <Text className="text-white font-bold text-lg">
                          {totalScore}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {match.status !== 'completed' && canEditMatch && (
                    <TouchableOpacity
                      className="bg-blue-600 rounded-lg py-2 flex-row items-center justify-center gap-1 mt-2"
                      onPress={() => {
                        setSelectedPlayerId(player.id);
                        setShowScoreModal(true);
                      }}
                    >
                      <Plus color="white" size={16} />
                      <Text className="text-white font-semibold text-sm">
                        Add Score
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Score Modal */}
      <Modal
        visible={showScoreModal}
        onRequestClose={() => setShowScoreModal(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-gray-900 bg-opacity-95 justify-end">
          <View className="bg-gray-800 rounded-t-3xl p-6 border-t border-gray-700">
            <Text className="text-2xl font-bold text-white mb-6">
              Record Score
            </Text>

            <TextInput
              placeholder="Enter score value"
              placeholderTextColor="#9CA3AF"
              value={scoreValue}
              onChangeText={setScoreValue}
              editable={!isUpdating}
              keyboardType="number-pad"
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white mb-6"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-700 rounded-lg py-3 items-center"
                onPress={() => setShowScoreModal(false)}
                disabled={isUpdating}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 items-center ${
                  isUpdating || !scoreValue
                    ? 'bg-blue-700 opacity-50'
                    : 'bg-blue-600'
                }`}
                onPress={handleAddScore}
                disabled={isUpdating || !scoreValue}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Add Score</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
