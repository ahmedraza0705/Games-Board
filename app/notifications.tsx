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
import { notificationService } from '@/services/notificationService';
import { ChevronLeft, Trash2, Bell, CheckCircle } from 'lucide-react-native';
import { Notification } from '@/types';
import { formatTimeAgo } from '@/utils/date';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();

      // Subscribe to new notifications
      const subscription = notificationService.subscribeToNotifications(
        user.id,
        () => {
          loadNotifications();
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_invitation':
        return '🎮';
      case 'tournament_update':
        return '🏆';
      case 'group_activity':
        return '👥';
      case 'achievement':
        return '⭐';
      default:
        return '📢';
    }
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
        <View className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex-row items-center justify-between pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 ml-4">
            <View className="flex-row items-center gap-2">
              <Bell color="#3B82F6" size={24} />
              <Text className="text-xl font-bold text-white">Notifications</Text>
            </View>
            {unreadCount > 0 && (
              <Text className="text-gray-400 text-sm">
                {unreadCount} unread
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <CheckCircle color="#3B82F6" size={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <View className="px-6 py-6">
          {notifications.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 border border-gray-700 items-center">
              <Bell color="#6B7280" size={48} />
              <Text className="text-white font-semibold mt-4 text-lg">
                No notifications
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                You're all caught up!
              </Text>
            </View>
          ) : (
            notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                className={`rounded-lg p-4 mb-3 border flex-row items-start gap-3 ${
                  notification.is_read
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-blue-900 bg-opacity-20 border-blue-700'
                }`}
                onPress={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id);
                  }
                  // Navigate to related item if applicable
                  if (notification.related_id) {
                    if (notification.type === 'match_invitation') {
                      router.push(`/games/${notification.related_id}`);
                    }
                  }
                }}
              >
                <View>
                  <Text className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${
                          notification.is_read
                            ? 'text-gray-400'
                            : 'text-white'
                        }`}
                      >
                        {notification.title}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${
                          notification.is_read
                            ? 'text-gray-500'
                            : 'text-gray-300'
                        }`}
                      >
                        {notification.message}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(notification.created_at)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(notification.id)}
                      className="ml-2"
                    >
                      <Trash2 color="#6B7280" size={18} />
                    </TouchableOpacity>
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
