import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

// 아바타 컴포넌트 래퍼
interface AvatarWrapperProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  className?: string;
}

export const AvatarWrapper: React.FC<AvatarWrapperProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  loading = false,
  className,
}) => {
  return (
    <Avatar size={size} loading={loading} className={className}>
      {src && !loading && <AvatarImage src={src} alt={alt || 'Avatar'} />}
      <AvatarFallback>{fallback || 'U'}</AvatarFallback>
    </Avatar>
  );
};