import {
  CreateGroupInput,
  FamilyGroup,
  GroupInvitation,
  UpdateGroupInput,
  UserNotification,
} from '../types';

export interface DataContextType {
  // Groups
  groups: FamilyGroup[];
  currentGroup: FamilyGroup | null;
  setCurrentGroup: (group: FamilyGroup | null) => void;

  // Group operations
  createGroup: (groupData: CreateGroupInput) => Promise<string>;
  updateGroup: (groupId: string, updates: UpdateGroupInput) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;

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
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // Loading states
  loading: boolean;
  error: string | null;