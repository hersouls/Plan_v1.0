
import { FamilyGroup } from '../types/group';

// App State Interface
export interface AppState {
  // Current group
  currentGroup: FamilyGroup | null;
  currentGroupId: string | null;

  // UI State
  sidebarOpen: boolean;
  darkMode: boolean;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;

  // Loading states
  loading: {
    groups: boolean;
    tasks: boolean;
    profile: boolean;
  };

  // Error states
  errors: {
    groups: string | null;
    tasks: string | null;
    profile: string | null;
  };
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Action Types
export type AppAction =
  | {
      type: 'SET_CURRENT_GROUP';
      payload: { group: FamilyGroup | null; groupId: string | null };
    }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | {
      type: 'ADD_NOTIFICATION';
      payload: Omit<AppNotification, 'id' | 'timestamp'>;
    }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | {
      type: 'SET_LOADING';
      payload: { key: keyof AppState['loading']; loading: boolean };
    }
  | {
      type: 'SET_ERROR';
      payload: { key: keyof AppState['errors']; error: string | null };
    }
  | { type: 'CLEAR_ERRORS' };

export interface AppContextType {
  state: AppState;

  // Actions
  setCurrentGroup: (group: FamilyGroup | null, groupId?: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Notifications
  addNotification: (
    notification: Omit<AppNotification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Loading and Error handling
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
  setError: (key: keyof AppState['errors'], error: string | null) => void;
  clearErrors: () => void;

  // Utility functions
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  showInfoMessage: (message: string) => void;
  showWarningMessage: (message: string) => void;
}