import { createContext } from 'react';
import {
  CreateGroupInput,
  FamilyGroup,
  GroupInvitation,
  UpdateGroupInput,
  UserNotification,
  GroupMember,
} from '../types';

export interface DataContextType {
  // Groups
  groups: FamilyGroup[];
  currentGroup: FamilyGroup | null;
  setCurrentGroup: (group: FamilyGroup | null) => void;
  groupMembers: GroupMember[];

  // Group operations
  createGroup: (groupData: CreateGroupInput) => Promise<string>;
  updateGroup: (groupId: string, updates: UpdateGroupInput) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<void>;
  leaveGroup: (_groupId: string) => Promise<void>;

  // Invitations
  invitations: GroupInvitation[];
  sendInvitation: (
    groupId: string,
    email: string,
    role: 'admin' | 'member'
  ) => Promise<void>;
  respondToInvitation: (invitationId: string, accept: boolean) => Promise<void>;

  // Notifications
  notifications: UserNotification[];
  markNotificationAsRead: (_notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (_notificationId: string) => Promise<void>;

  // Loading states
  loading: boolean;
  error: string | null;
}

// Create Context
export const DataContext = createContext<DataContextType | undefined>(undefined);