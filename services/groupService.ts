import { supabase } from './supabase';
import { Group, GroupMember } from '@/types';

export const groupService = {
  // Create group
  createGroup: async (name: string, description: string, userId: string) => {
    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name,
          description,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    if (data) {
      await groupService.addGroupMember(data.id, userId, 'owner');
    }

    return data as Group;
  },

  // Get user's groups
  getUserGroups: async (userId: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, members:group_members(count)')
      .or(`created_by.eq.${userId},group_members.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get group by ID
  getGroupById: async (groupId: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, members:group_members(*, user:users(*))')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  // Add member to group
  addGroupMember: async (groupId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member') => {
    const { data, error } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: userId,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as GroupMember;
  },

  // Remove member from group
  removeGroupMember: async (groupMemberId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', groupMemberId);

    if (error) throw error;
  },

  // Update group
  updateGroup: async (groupId: string, updates: Partial<Group>) => {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data as Group;
  },

  // Get group leaderboard
  getGroupLeaderboard: async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('user:users(*, stats:user_stats(*))')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Subscribe to group changes
  subscribeToGroup: (groupId: string, callback: (data: any) => void) => {
    const subscription = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
