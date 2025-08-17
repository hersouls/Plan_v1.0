import {
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

import { auth } from '../lib/firebase';
import { userService } from '../lib/firestore';
import { ExtendedUser, AuthContextType } from '../types/auth';
import { User } from '../types/user';
import { AuthContext } from './AuthContextDef';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Create initial user profile
  const createUserProfile = async (user: ExtendedUser) => {
    try {
        // Add safety check for userService
      if (!userService || typeof userService.getUserProfile !== 'function') {
        return;
      }

      const existingProfile = await userService.getUserProfile(user.uid);
      if (!existingProfile) {
        const initialProfile: Partial<User> = {
          displayName: user.displayName || user.email || 'Unknown User',
          email: user.email || '',
          // Only include avatar if photoURL exists and is not null/undefined
          ...(user.photoURL ? { photoURL: user.photoURL } : {}),
          groupIds: [],
          preferences: {
            theme: 'system',
            language: 'ko',
            timezone: 'Asia/Seoul',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            weekStartsOn: 1,
            notifications: {
              push: true,
              taskReminders: true,
              taskAssignments: true,
              taskCompletions: true,
              taskComments: true,
              dailySummary: true,
              weeklyReport: true,
            },
            defaultTaskSettings: {
              priority: 'medium',
              category: 'household',
              reminderTime: '1h',
            },
            privacy: {
              profileVisible: true,
              activityVisible: true,
              statsVisible: true,
              showOnlineStatus: true,
              showLastSeen: true,
              showTaskActivity: true,
            },
          },
          stats: {
            totalTasksCreated: 0,
            totalTasksCompleted: 0,
            totalTasksAssigned: 0,
            currentStreak: 0,
            longestStreak: 0,
            completionRate: 0,
          },
          badges: [],
          achievements: [],
          points: 0,
          level: 1,
          loginCount: 1,
        };

        await userService.createOrUpdateUserProfile(user.uid, initialProfile);
      } else {
        // Update login count and last login with safe data
        const updateData: Partial<User> = {
          loginCount: ((existingProfile as { loginCount?: number }).loginCount || 0) + 1,
          lastLoginAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp, // 추가: 업데이트 시간
          // Only update photoURL if it's not undefined/null
          ...(user.photoURL && { photoURL: user.photoURL }),
        };

        await userService.createOrUpdateUserProfile(user.uid, updateData);
      }
    } catch {
        // Handle error silently
      }
  };

  useEffect(() => {
    // Firebase auth 객체가 제대로 초기화되었는지 확인
    if (!auth) {
      setLoading(false);
      setError('Firebase 인증 서비스를 초기화할 수 없습니다.');
      return;
    }

    setAuthInitialized(true);
    let profileUnsubscribe: (() => void) | null = null;
    let isSubscribed = true;
    let authUnsubscribe: (() => void) | null = null;

    const setupAuthListener = () => {
      try {
        authUnsubscribe = onAuthStateChanged(
          auth,
          async (user: ExtendedUser | null) => {

            if (!isSubscribed) return;

            setUser(user);

            if (user) {
              try {
                // Create or update user profile
                await createUserProfile(user);

                if (!isSubscribed) return;


                // 실시간 구독 대신 일회성 데이터 읽기 사용 (assertion 에러 방지)
                try {
                  const profile = await userService.getUserProfile(user.uid);
                  if (isSubscribed) {
                    setUserProfile(profile);
                  }
                } catch {
                  if (isSubscribed) {
                    setUserProfile(null);
                  }
                }

                // 실시간 프로필 구독 추가
                try {
                  profileUnsubscribe = userService.subscribeToUserProfile(
                    user.uid,
                    (profile) => {
                      if (isSubscribed) {
                        setUserProfile(profile);
                      }
                    }
                  );
                } catch {
                  // Handle error silently
                }
              } catch {
                // Handle error silently
              }

            } else {
              setUserProfile(null);
              if (profileUnsubscribe) {
                try {
                  profileUnsubscribe();
                } catch {
                  // Handle error silently
                }
                profileUnsubscribe = null;
              }
            }

            if (isSubscribed) {
              setLoading(false);
            }
          }
        );
      } catch {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    setupAuthListener();

    return () => {
      isSubscribed = false;

      if (authUnsubscribe) {
        try {
          authUnsubscribe();
        } catch {
          // Handle error silently
        }
      }

      if (profileUnsubscribe) {
        try {
          profileUnsubscribe();
        } catch {
          // Handle error silently
        }
      }
    };
  }, []);

  const signInAnonymously = async () => {
    try {
      setError(null);
      setLoading(true);
      await firebaseSignInAnonymously(auth);
    } catch (_err) {
      setError(
        err instanceof Error ? err.message : '익명 로그인에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      await firebaseSignInWithEmailAndPassword(auth, email, password);
    } catch (_err) {
      setError(
        err instanceof Error ? err.message : '이메일 로그인에 실패했습니다.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailAndPassword = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 사용자 프로필에 displayName 설정
      if (displayName && result.user) {
        await updateProfile(result.user, {
          displayName: displayName,
        });
      }

      return result;
    } catch (_err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (_err) {
      setError(
        err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.'
      );
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (_err) {
      setError(
        err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (_err) {
      setError(
        err instanceof Error ? err.message : 'GitHub 로그인에 실패했습니다.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      return { success: true };
    } catch (_err) {
      const errorMessage =
        err instanceof Error ? err.message : '로그아웃에 실패했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('User not authenticated');

    await userService.createOrUpdateUserProfile(user.uid, updates);
      // 프로필 업데이트 후 사용자 프로필 새로고침
      await refreshUserProfile();
    
  };

  // Refresh user profile from Firestore
  const refreshUserProfile = async () => {
    if (!user?.uid) return;

    try {
      const profile = await userService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch {
        // Handle error silently
      }
  };

  // Update user password
  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);
      await firebaseUpdatePassword(user, newPassword);
    } catch (_err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '비밀번호 업데이트에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signInAnonymously,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    updatePassword,
    signOut,
    updateUserProfile,
    refreshUserProfile,
  };

  // Firebase auth가 초기화되지 않은 경우 로딩 화면 표시
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-blue-600 mb-2">초기화 중...</h1>
          <p style={{ color: 'var(--semantic-text-secondary)' }}>
            Firebase 인증 서비스를 초기화하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
