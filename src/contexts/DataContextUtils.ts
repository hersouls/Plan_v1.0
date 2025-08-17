// DataContext 유틸리티 함수들
// Fast Refresh 경고 해결을 위해 별도 파일로 분리

export const createNotificationErrorHandler = (setError: (error: string | null) => void) => {
  return (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : '알림 처리에 실패했습니다.';
    setError(errorMessage);
    throw err;
  };
};

export const createGroupErrorHandler = (setError: (error: string | null) => void) => {
  return (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : '그룹 처리에 실패했습니다.';
    setError(errorMessage);
    throw err;
  };
};