import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { NotificationService } from '../lib/notifications';
import { Notification, NotificationStats } from '../types/notification';

// 타입 정의
export type NotificationData = {
  id?: string;
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
};

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  markAsRead: (_notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (_notificationId: string) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 알림 데이터 로드
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    const loadNotifications = async () => {
      try {
        const [notificationsData, statsData] = await Promise.all([
          NotificationService.getUserNotifications(user.uid, { limit: 50 }),
          NotificationService.getNotificationStats(user.uid),
        ]);

        setNotifications(notificationsData);
        setStats(statsData);
      } catch {
        setError('알림을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.uid]);

  // 실시간 알림 구독
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      user.uid,
      newNotifications => {
        setNotifications(newNotifications);
        // 통계도 업데이트
        const newStats: NotificationStats = {
          total: newNotifications.length,
          unread: newNotifications.filter(n => n.status === 'unread').length,
          read: newNotifications.filter(n => n.status === 'read').length,
          byType: {
            task: newNotifications.filter(n => n.type === 'task').length,
            group: newNotifications.filter(n => n.type === 'group').length,
            system: newNotifications.filter(n => n.type === 'system').length,
            reminder: newNotifications.filter(n => n.type === 'reminder')
              .length,
          },
        };
        setStats(newStats);
      },
      { limit: 50 }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // 알림 읽음 처리
  const markAsRead = async (_notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'read' as const, readAt: new Date() }
            : n
        )
      );
    } catch {
        // Handle error silently
      }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await NotificationService.markAllAsRead(user.uid);
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const, readAt: new Date() }))
      );
    } catch {
        // Handle error silently
      }
  };

  // 알림 삭제
  const deleteNotification = async (_notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch {
        // Handle error silently
      }
  };

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

// Export types
export type NotificationData = {
  id: string;
  type: 'task' | 'group' | 'system' | 'reminder';
  title: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: Date;
  readAt?: Date;
  data?: Record<string, unknown>;
};

export type NotificationPermissionState = 'granted' | 'denied' | 'default';

export type UseNotificationsReturn = {
  notifications: NotificationData[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  markAsRead: (_notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (_notificationId: string) => Promise<void>;
};
