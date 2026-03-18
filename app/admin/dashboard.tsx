import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { adminService } from '@/services/adminService';
import { ChevronLeft, Users, Gamepad2, Trophy, TrendingUp } from 'lucide-react-native';

interface PlatformStats {
  total_users: number;
  total_matches: number;
  completed_matches: number;
  total_games: number;
  pro_users: number;
  free_users: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
      return;
    }

    loadAdminData();
  }, [user?.id]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [platformStats, revenue] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRevenueInsights(),
      ]);

      setStats(platformStats);
      setRevenueData(revenue);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAdminData();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white">Failed to load admin data</Text>
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
        <View className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex-row items-center justify-between pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white flex-1 ml-4">
            Admin Dashboard
          </Text>
        </View>

        {/* Statistics Grid */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-white mb-4">Platform Overview</Text>

          {/* Users Stats */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Users color="#3B82F6" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Total Users</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.total_users}
              </Text>
              <View className="flex-row gap-2 mt-2">
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs">Free</Text>
                  <Text className="text-blue-400 font-semibold">
                    {stats.free_users}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs">Pro</Text>
                  <Text className="text-purple-400 font-semibold">
                    {stats.pro_users}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Gamepad2 color="#10B981" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Total Games</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.total_games}
              </Text>
            </View>
          </View>

          {/* Matches Stats */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <Trophy color="#F59E0B" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Total Matches</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.total_matches}
              </Text>
            </View>

            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <View className="flex-row items-center gap-2 mb-2">
                <TrendingUp color="#10B981" size={20} />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Completed</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.completed_matches}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                {stats.total_matches > 0
                  ? (
                      ((stats.completed_matches / stats.total_matches) * 100).toFixed(
                        1
                      ) + '%'
                    )
                  : '0%'}
              </Text>
            </View>
          </View>

          {/* Revenue Insights */}
          {revenueData && (
            <View className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-4 border border-purple-700 mb-4">
              <Text className="text-gray-300 text-xs mb-2">Monthly Recurring Revenue</Text>
              <View className="flex-row items-end gap-2">
                <Text className="text-white text-3xl font-bold">
                  {revenueData.monthly_recurring_revenue_formatted}
                </Text>
                <Text className="text-gray-300 text-sm mb-1">
                  ({revenueData.active_pro_users} pro users)
                </Text>
              </View>
            </View>
          )}

          {/* Management Sections */}
          <Text className="text-lg font-bold text-white mb-4 mt-6">Management</Text>

          <TouchableOpacity
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3 flex-row items-center justify-between"
            onPress={() => router.push('/admin/users')}
          >
            <View className="flex-row items-center gap-3">
              <Users color="#3B82F6" size={24} />
              <View>
                <Text className="text-white font-semibold">Users</Text>
                <Text className="text-gray-400 text-xs">Manage user accounts</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3 flex-row items-center justify-between"
            onPress={() => router.push('/admin/matches')}
          >
            <View className="flex-row items-center gap-3">
              <Trophy color="#F59E0B" size={24} />
              <View>
                <Text className="text-white font-semibold">Matches</Text>
                <Text className="text-gray-400 text-xs">Review and manage matches</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3 flex-row items-center justify-between"
            onPress={() => router.push('/admin/games')}
          >
            <View className="flex-row items-center gap-3">
              <Gamepad2 color="#10B981" size={24} />
              <View>
                <Text className="text-white font-semibold">Games</Text>
                <Text className="text-gray-400 text-xs">Manage game catalog</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-row items-center justify-between"
            onPress={() => Alert.alert('Info', 'Analytics coming soon')}
          >
            <View className="flex-row items-center gap-3">
              <TrendingUp color="#3B82F6" size={24} />
              <View>
                <Text className="text-white font-semibold">Analytics</Text>
                <Text className="text-gray-400 text-xs">View detailed analytics</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
