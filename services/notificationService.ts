import { supabase } from './supabase';
import { Notification } from '@/types';

export const notificationService = {
  // Get user notifications
  getUserNotifications: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  },

  // Get unread notifications count
  getUnreadCount: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data?.length || 0;
  },

  // Create notification
  createNotification: async (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId?: string
  ) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          related_id: relatedId,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Delete all notifications
  deleteAllNotifications: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Subscribe to user notifications
  subscribeToNotifications: (userId: string, callback: (data: any) => void) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // Create match invitation notification
  sendMatchInvitation: async (userId: string, matchId: string, matchName: string) => {
    return notificationService.createNotification(
      userId,
      'match_invitation',
      'You were invited to a match!',
      `Join the match: ${matchName}`,
      matchId
    );
  },

  // Create tournament update notification
  sendTournamentUpdate: async (userId: string, tournamentId: string, message: string) => {
    return notificationService.createNotification(
      userId,
      'tournament_update',
      'Tournament Update',
      message,
      tournamentId
    );
  },

  // Create group activity notification
  sendGroupActivity: async (userId: string, groupId: string, message: string) => {
    return notificationService.createNotification(
      userId,
      'group_activity',
      'Group Activity',
      message,
      groupId
    );
  },

  // Create achievement notification
  sendAchievement: async (userId: string, title: string, message: string) => {
    return notificationService.createNotification(
      userId,
      'achievement',
      title,
      message
    );
  },

  // Create system notification
  sendSystemNotification: async (userId: string, title: string, message: string) => {
    return notificationService.createNotification(
      userId,
      'system',
      title,
      message
    );
  },
};
