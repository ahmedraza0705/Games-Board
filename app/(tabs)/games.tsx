import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Plus, Grid, Gamepad2 } from 'lucide-react-native';
import { Game } from '@/types';

export default function GamesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameDescription, setNewGameDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGames();
  }, [user?.id]);

  const loadGames = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadGames();
    setIsRefreshing(false);
  };

  const handleCreateGame = async () => {
    if (!newGameName.trim() || !user?.id) {
      return;
    }

    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            name: newGameName,
            description: newGameDescription,
            created_by: user.id,
            max_players: 10,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGames([data, ...games]);
      setNewGameName('');
      setNewGameDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartMatch = (gameId: string) => {
    router.push(`/games/${gameId}/create-match`);
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
        <View className="bg-gradient-to-b from-gray-800 to-gray-900 px-6 py-8 pt-12 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-white">Games</Text>
            <Text className="text-gray-400">
              {games.length} game{games.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-2"
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Games Grid */}
        <View className="px-6 py-6">
          {games.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 border border-gray-700 items-center">
              <Gamepad2 color="#6B7280" size={48} />
              <Text className="text-white font-semibold mt-4 text-lg">
                No games yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Create a new game or join existing ones to start playing
              </Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-lg px-6 py-3 mt-6"
                onPress={() => setShowCreateModal(true)}
              >
                <Text className="text-white font-semibold">Create Game</Text>
              </TouchableOpacity>
            </View>
          ) : (
            games.map((game) => (
              <TouchableOpacity
                key={game.id}
                className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700"
                onPress={() => handleStartMatch(game.id)}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">
                      {game.name}
                    </Text>
                    {game.description && (
                      <Text className="text-gray-400 text-sm mt-1">
                        {game.description}
                      </Text>
                    )}
                  </View>
                  <View className="bg-blue-600 bg-opacity-20 rounded-full px-3 py-1">
                    <Text className="text-blue-400 text-xs font-semibold">
                      Max {game.max_players}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-blue-600 rounded-lg py-2 flex-row items-center justify-center gap-2 mt-3"
                  onPress={() => handleStartMatch(game.id)}
                >
                  <Gamepad2 color="white" size={16} />
                  <Text className="text-white font-semibold">Start Match</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Game Modal */}
      <Modal
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-gray-900 bg-opacity-95 justify-end">
          <View className="bg-gray-800 rounded-t-3xl p-6 border-t border-gray-700">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-white">Create New Game</Text>
            </View>

            {/* Game Name */}
            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Game Name</Text>
              <TextInput
                placeholder="Enter game name..."
                placeholderTextColor="#9CA3AF"
                value={newGameName}
                onChangeText={setNewGameName}
                editable={!isCreating}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2">Description (Optional)</Text>
              <TextInput
                placeholder="Enter game description..."
                placeholderTextColor="#9CA3AF"
                value={newGameDescription}
                onChangeText={setNewGameDescription}
                editable={!isCreating}
                multiline
                numberOfLines={3}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-700 rounded-lg py-3 items-center"
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 items-center ${
                  isCreating ? 'bg-blue-700 opacity-50' : 'bg-blue-600'
                }`}
                onPress={handleCreateGame}
                disabled={isCreating || !newGameName.trim()}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
