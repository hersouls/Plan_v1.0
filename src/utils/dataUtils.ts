// Utility functions for data operations
export const createNotificationPlaceholder = (message: string) => {
  return {
    id: `placeholder-${Date.now()}`,
    type: 'system' as const,
    title: '알림',
    message,
    status: 'unread' as const,
    createdAt: new Date(),
  };
};

export const createErrorNotification = (error: unknown) => {
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  return createNotificationPlaceholder(message);
};