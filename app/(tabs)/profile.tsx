import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { User, LogOut, Trophy, Settings, Crown, Zap } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.replace('/auth/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          } finally {
            setIsLoggingOut(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    return tier === 'pro'
      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
      : 'bg-blue-600';
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView>
        {/* Header with Avatar */}
        <View className="bg-gradient-to-b from-gray-800 to-gray-900 px-6 py-8 pt-12">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
              <User color="white" size={48} />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              {user.full_name}
            </Text>
            <Text className="text-gray-400 mt-1">{user.email}</Text>
          </View>

          {/* Subscription Badge */}
          <View className={`${getSubscriptionBadgeColor(user.subscription_tier)} rounded-lg py-3 items-center flex-row justify-center gap-2`}>
            {user.subscription_tier === 'pro' ? (
              <Crown color="white" size={20} />
            ) : (
              <Zap color="white" size={20} />
            )}
            <Text className="text-white font-semibold capitalize">
              {user.subscription_tier} Plan
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-white mb-4">Your Stats</Text>
          
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Trophy color="#F59E0B" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Total Games</Text>
              <Text className="text-white text-2xl font-bold">0</Text>
            </View>

            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Trophy color="#10B981" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Total Wins</Text>
              <Text className="text-white text-2xl font-bold">0</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Zap color="#F59E0B" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Win Rate</Text>
              <Text className="text-white text-2xl font-bold">0%</Text>
            </View>

            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Trophy color="#EF4444" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Streak</Text>
              <Text className="text-white text-2xl font-bold">0</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-white mb-4">Account</Text>

          <TouchableOpacity
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-row items-center justify-between mb-3"
            onPress={() => setShowSettingsModal(true)}
          >
            <View className="flex-row items-center gap-3">
              <Settings color="#3B82F6" size={20} />
              <Text className="text-white font-semibold">Settings</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4 flex-row items-center justify-between"
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <View className="flex-row items-center gap-3">
              <LogOut color="#EF4444" size={20} />
              <Text className="text-red-400 font-semibold">Sign Out</Text>
            </View>
            {isLoggingOut && <ActivityIndicator color="#EF4444" />}
          </TouchableOpacity>
        </View>

        {/* Subscription Plans Section */}
        <View className="px-6 py-6 pb-12">
          <Text className="text-lg font-bold text-white mb-4">Upgrade Your Plan</Text>

          {/* Free Plan */}
          <View
            className={`rounded-lg p-4 mb-3 border ${
              user.subscription_tier === 'free'
                ? 'bg-blue-900 bg-opacity-20 border-blue-700'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-white font-semibold text-lg">Free Plan</Text>
              {user.subscription_tier === 'free' && (
                <View className="bg-blue-600 rounded-full px-2 py-1">
                  <Text className="text-white text-xs font-semibold">Current</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-400 text-sm mb-3">
              Limited matches, basic leaderboard access
            </Text>
            {user.subscription_tier !== 'free' && (
              <TouchableOpacity className="bg-blue-600 rounded-lg py-2 items-center">
                <Text className="text-white font-semibold">Downgrade</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pro Plan */}
          <View
            className={`rounded-lg p-4 border ${
              user.subscription_tier === 'pro'
                ? 'bg-purple-900 bg-opacity-20 border-purple-700'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Crown color="#9333EA" size={20} />
                <Text className="text-white font-semibold text-lg">Pro Plan</Text>
              </View>
              {user.subscription_tier === 'pro' && (
                <View className="bg-purple-600 rounded-full px-2 py-1">
                  <Text className="text-white text-xs font-semibold">Current</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-400 text-sm mb-3">
              Unlimited matches, tournaments, group leaderboards, analytics
            </Text>
            {user.subscription_tier !== 'pro' && (
              <TouchableOpacity className="bg-purple-600 rounded-lg py-2 items-center">
                <Text className="text-white font-semibold">Upgrade to Pro</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-gray-900 bg-opacity-95 justify-end">
          <View className="bg-gray-800 rounded-t-3xl p-6 border-t border-gray-700">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-white">Settings</Text>
            </View>

            {/* Placeholder settings */}
            <View className="space-y-4">
              <TouchableOpacity className="bg-gray-700 rounded-lg p-4">
                <Text className="text-white font-semibold">Notifications</Text>
                <Text className="text-gray-400 text-sm mt-1">Manage notification preferences</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-700 rounded-lg p-4">
                <Text className="text-white font-semibold">Privacy</Text>
                <Text className="text-gray-400 text-sm mt-1">Control your profile visibility</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-700 rounded-lg p-4">
                <Text className="text-white font-semibold">About</Text>
                <Text className="text-gray-400 text-sm mt-1">App information and version</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-gray-700 rounded-lg py-3 items-center mt-6"
              onPress={() => setShowSettingsModal(false)}
            >
              <Text className="text-white font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
