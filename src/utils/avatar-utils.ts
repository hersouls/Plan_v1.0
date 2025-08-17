// 아바타 컴포넌트 헬퍼 함수
export const getAvatarInitials = (name?: string, email?: string): string => {
  if (!name && !email) return 'U';

  const displayName = name || email || '';
  const parts = displayName.split(' ');

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.substring(0, 2).toUpperCase();
};