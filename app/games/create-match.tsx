import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { matchService } from '@/services/matchService';
import { ChevronLeft, Plus, User, Trash2 } from 'lucide-react-native';

interface MatchPlayer {
  userId: string;
  userName: string;
}

export default function CreateMatchScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  
  const [matchName, setMatchName] = useState('');
  const [players, setPlayers] = useState<MatchPlayer[]>([
    { userId: user?.id || '', userName: user?.full_name || '' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      
      const filtered = (data || []).filter(
        u => !players.some(p => p.userId === u.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddPlayer = (userId: string, userName: string) => {
    setPlayers([...players, { userId, userName }]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleRemovePlayer = (userId: string) => {
    if (players.length === 1) {
      Alert.alert('Error', 'Match must have at least 1 player');
      return;
    }
    setPlayers(players.filter(p => p.userId !== userId));
  };

  const handleCreateMatch = async () => {
    if (!matchName.trim()) {
      Alert.alert('Error', 'Please enter a match name');
      return;
    }

    if (!gameId || !user?.id) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      setIsCreating(true);
      
      // Create match
      const match = await matchService.createMatch(gameId, matchName, user.id);

      // Add all players
      for (const player of players) {
        await matchService.addPlayerToMatch(match.id, player.userId);
      }

      Alert.alert('Success', 'Match created!', [
        {
          text: 'Go to Match',
          onPress: () => router.push(`/games/${match.id}`),
        },
      ]);
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Failed to create match');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex-row items-center justify-between pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 ml-4">
          Create Match
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Match Name */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-2">Match Name</Text>
          <TextInput
            placeholder="e.g., Tuesday Night Games"
            placeholderTextColor="#9CA3AF"
            value={matchName}
            onChangeText={setMatchName}
            editable={!isCreating}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </View>

        {/* Players Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-semibold">
              Players ({players.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              className="bg-blue-600 rounded-lg px-3 py-1 flex-row items-center gap-1"
            >
              <Plus color="white" size={16} />
              <Text className="text-white text-sm font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Players List */}
          <View className="bg-gray-800 rounded-lg border border-gray-700">
            {players.map((player, index) => (
              <View
                key={player.userId}
                className={`flex-row items-center justify-between p-4 ${
                  index !== players.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
                    <User color="white" size={20} />
                  </View>
                  <View>
                    <Text className="text-white font-semibold">
                      {player.userName}
                    </Text>
                    {player.userId === user?.id && (
                      <Text className="text-gray-400 text-xs">You</Text>
                    )}
                  </View>
                </View>
                {player.userId !== user?.id && (
                  <TouchableOpacity
                    onPress={() => handleRemovePlayer(player.userId)}
                    disabled={isCreating}
                  >
                    <Trash2 color="#EF4444" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Search Users */}
        {showSearch && (
          <View className="mb-6">
            <TextInput
              placeholder="Search players..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchUsers}
              editable={!isCreating}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2"
            />

            {searchResults.length > 0 && (
              <View className="bg-gray-800 rounded-lg border border-gray-700">
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.id}
                    className={`p-4 flex-row justify-between items-center ${
                      index !== searchResults.length - 1
                        ? 'border-b border-gray-700'
                        : ''
                    }`}
                    onPress={() =>
                      handleAddPlayer(result.id, result.full_name)
                    }
                  >
                    <Text className="text-white font-medium">
                      {result.full_name}
                    </Text>
                    <Plus color="#3B82F6" size={20} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Button */}
      <View className="px-6 py-6 border-t border-gray-700">
        <TouchableOpacity
          className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${
            isCreating || !matchName.trim()
              ? 'bg-blue-700 opacity-50'
              : 'bg-blue-600'
          }`}
          onPress={handleCreateMatch}
          disabled={isCreating || !matchName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Plus color="white" size={20} />
              <Text className="text-white font-semibold text-base">
                Create Match
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
