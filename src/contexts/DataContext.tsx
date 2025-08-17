import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { groupService, userService } from '../lib/firestore';
import {
  CreateGroupInput,
  FamilyGroup,
  GroupInvitation,
  UpdateGroupInput,
  UserNotification,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { DataContextType } from './DataContextTypes';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [currentGroup, setCurrentGroupState] = useState<FamilyGroup | null>(
    null
  );
  const [invitations] = useState<GroupInvitation[]>([]);
  const [notifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Load user's groups when user profile changes
  useEffect(() => {
    if (!user || !userProfile) {
      setGroups([]);
      setCurrentGroupState(null);
      setLoading(false);
      isInitialLoad.current = true;
      return;
    }

    setLoading(true);

    // Check localStorage for saved current group
    const savedGroupId = localStorage.getItem('currentGroupId');
    // Load all groups that user belongs to
    const loadGroups = async () => {
      try {
        const groupPromises = userProfile.groupIds.map(async groupId => {
          try {
            const group = await groupService.getGroup(groupId);
            return group;
          } catch {
            // 그룹 로딩 실패 시에도 계속 진행
            return null;
          }
        });

        const groupResults = await Promise.all(groupPromises);
        const validGroups = groupResults.filter(
          group => group !== null
        ) as FamilyGroup[];

        setGroups(validGroups);

        // Set current group logic
        if (validGroups.length > 0) {
          let groupToSet = null;

          // First, try to restore from localStorage
          if (savedGroupId) {
            const savedGroup = validGroups.find(g => g.id === savedGroupId);
            if (savedGroup) {
              groupToSet = savedGroup;
            }
          }

          // If no saved group or saved group not found, use first group
          if (!groupToSet && isInitialLoad.current) {
            groupToSet = validGroups[0];
          }

          if (groupToSet) {
            setCurrentGroupState(groupToSet);
            isInitialLoad.current = false;
          }
        } else {
          // No valid groups found
        }
      } catch {
        setError('그룹 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [user, userProfile]);

  // Set current group
  const setCurrentGroup = useCallback((group: FamilyGroup | null) => {
    setCurrentGroupState(group);
    // Store in localStorage for persistence
    if (group) {
      localStorage.setItem('currentGroupId', group.id);
    } else {
      localStorage.removeItem('currentGroupId');
    }
  }, []);

  // Create group
  const createGroup = useCallback(
    async (groupData: CreateGroupInput): Promise<string> => {
      if (!user) throw new Error('User not authenticated');

      try {
        setError(null);
        const groupId = await groupService.createGroup(groupData);

        // Update user profile to include new group
        if (userProfile) {
          const updatedGroupIds = [...userProfile.groupIds, groupId];
          await userService.createOrUpdateUserProfile(user.uid, {
            groupIds: updatedGroupIds,
          });
        }

        return groupId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '그룹 생성에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user, userProfile]
  );

  // Update group
  const updateGroup = useCallback(
    async (groupId: string, updates: UpdateGroupInput): Promise<void> => {
      try {
        setError(null);
        await groupService.updateGroup(groupId, updates);

        // Update local state
        setGroups(prev =>
          prev.map(group => {
            if (group.id === groupId) {
              const updatedGroup = { ...group };
              // Handle settings merge separately to preserve required fields
              if (updates.settings) {
                updatedGroup.settings = {
                  ...group.settings,
                  ...updates.settings,
                };
              }
              // Apply other updates
              return {
                ...updatedGroup,
                ...updates,
                settings: updatedGroup.settings,
              };
            }
            return group;
          })
        );

        // Update current group if it's the one being updated
        if (currentGroup && currentGroup.id === groupId) {
          setCurrentGroupState(prev => {
            if (!prev) return null;
            const updatedGroup = { ...prev };
            // Handle settings merge separately to preserve required fields
            if (updates.settings) {
              updatedGroup.settings = { ...prev.settings, ...updates.settings };
            }
            // Apply other updates
            return {
              ...updatedGroup,
              ...updates,
              settings: updatedGroup.settings,
            };
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '그룹 업데이트에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [currentGroup]
  );

  // Join group (by invite code)
  const joinGroup = useCallback(
    async (_inviteCode: string): Promise<void> => {
      if (!user || !userProfile) throw new Error('User not authenticated');

      try {
        setError(null);
        // This would require implementing invite code logic in groupService
        // For now, this is a placeholder
        throw new Error('초대 코드로 그룹 참가 기능은 구현 중입니다.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '그룹 참가에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user, userProfile]
  );

  // Leave group
  const leaveGroup = useCallback(
    async (groupId: string): Promise<void> => {
      if (!user || !userProfile) throw new Error('User not authenticated');

      try {
        setError(null);
        await groupService.removeMemberFromGroup(groupId, user.uid);

        // Update user profile to remove group
        const updatedGroupIds = userProfile.groupIds.filter(
          id => id !== groupId
        );
        await userService.createOrUpdateUserProfile(user.uid, {
          groupIds: updatedGroupIds,
        });

        // Update local state
        setGroups(prev => prev.filter(group => group.id !== groupId));

        // Clear current group if user left it
        if (currentGroup && currentGroup.id === groupId) {
          setCurrentGroupState(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '그룹 탈퇴에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user, userProfile, currentGroup]
  );

  // Send invitation
  const sendInvitation = useCallback(
    async (
      _groupId: string,
      _email: string,
      _role: 'admin' | 'member'
    ): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      try {
        setError(null);
        // This would require implementing invitation service
        // For now, this is a placeholder
        throw new Error('초대 기능은 구현 중입니다.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '초대 전송에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user]
  );

  // Respond to invitation
  const respondToInvitation = useCallback(
    async (_invitationId: string, _accept: boolean): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      try {
        setError(null);
        // This would require implementing invitation response logic
        // For now, this is a placeholder
        throw new Error('초대 응답 기능은 구현 중입니다.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '초대 응답에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user]
  );

  // Mark notification as read
  const markNotificationAsRead = useCallback(
    async (_notificationId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      try {
        setError(null);
        // This would require implementing notification service
        // For now, this is a placeholder
        throw new Error('알림 읽음 처리 기능은 구현 중입니다.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '알림 처리에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user]
  );

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      // This would require implementing bulk notification update
      // For now, this is a placeholder
      throw new Error('모든 알림 읽음 처리 기능은 구현 중입니다.');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알림 처리에 실패했습니다.';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(
    async (_notificationId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      try {
        setError(null);
        // This would require implementing notification deletion
        // For now, this is a placeholder
        throw new Error('알림 삭제 기능은 구현 중입니다.');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '알림 삭제에 실패했습니다.';
        setError(errorMessage);
        throw err;
      }
    },
    [user]
  );

  const value: DataContextType = {
    // Groups
    groups,
    currentGroup,
    setCurrentGroup,

    // Group operations
    createGroup,
    updateGroup,
    joinGroup,
    leaveGroup,

    // Invitations
    invitations,
    sendInvitation,
    respondToInvitation,

    // Notifications
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,

    // Loading states
    loading,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export default DataProvider;
