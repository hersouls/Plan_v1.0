export { AuthProvider } from './AuthContext';
export { DataProvider, useData } from './DataContext';
export { AppProvider } from './AppContext';
export { TaskProvider, useTask } from './TaskContext';

// Re-export hooks
export { useAuth } from '../hooks/useAuth';
export { useApp } from '../hooks/useApp';

// Re-export types
export type { AuthContextType, ExtendedUser } from '../types/auth';
export type { 
  AppState, 
  AppNotification, 
  AppContextType, 
  AppAction 
} from './AppContext';
export type { 
  TaskState, 
  TaskFilters, 
  TaskSortBy, 
  TaskStats, 
  TaskContextType, 
  TaskAction 
} from './TaskContext';