
import { ExtendedUser } from '../types/auth';
import { User } from '../types/user';

export interface AuthContextType {
  user: ExtendedUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  authInitialized: boolean;
  signInAnonymously: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailAndPassword: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<unknown>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}