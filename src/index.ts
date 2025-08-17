// Main entry point for all exports

// Export specific types to avoid conflicts
export * from './types/ui';
export * from './types/app';
export * from './types/auth';
export * from './types/task';
export * from './types/user';
export * from './types/group';
export * from './types/plan';
export * from './types/trip';
export * from './types/analytics';
export * from './types/typography';

// Export common types individually to avoid conflicts
export type { 
  TimeRange, 
  Address, 
  ContactInfo, 
  SocialLinks, 
  LanguageCode, 
  Timezone, 
  CurrencyCode, 
  DeviceType, 
  BrowserType, 
  Environment, 
  LogLevel, 
  AnalyticsEvent, 
  ErrorBoundaryState, 
  FeatureFlag, 
  ABTestVariant 
} from './types/common';

// Export contexts and providers
export { AppProvider } from './contexts/AppContext';
export { AuthProvider } from './contexts/AuthContext';
export { DataProvider } from './contexts/DataContext';
export { TaskProvider } from './contexts/TaskContext';
export { useAuth } from './hooks/useAuth';
export { useApp } from './hooks/useApp';
export { useData } from './contexts/utils/dataContext.utils';

// Export hooks (excluding conflicting useTask)
export * from './hooks/useAuth';
export * from './hooks/useApp';
export * from './hooks/useData';
export * from './hooks/useGroup';
export * from './hooks/useOffline';
export * from './hooks/useTasks';
export * from './hooks/useUser';

// Re-export specific types to resolve conflicts
export type { Coordinates as MapCoordinates } from './utils/mapUrlParser';
export { useTask as useTaskHook } from './hooks/useTask';

// Export all components
export * from './components/ui/GlassCard';
export * from './components/ui/WaveButton';
export * from './components/layout/WaveBackground';

// Export utilities
export * from './utils';
export * from './lib/firebase';
export * from './lib/firestore';
export * from './lib/fcm';

// Export version info
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const APP_NAME = 'Moonwave Plan';