export { AuthProvider } from './AuthContext';
export { DataProvider, useData } from './DataContext';
export { AppProvider } from './AppContext';
export { TaskProvider, useTask } from './TaskContext';

// Re-export hooks from hooks directory
export { useAuth } from '../hooks/useAuth';
export { useApp } from '../hooks/useApp';

// Re-export types
export type { AuthContextType, ExtendedUser } from '../types/auth';
export type { 
  AppState, 
  AppNotification, 
  AppContextType, 
  AppAction 
} from './AppContextTypes';
export type { 
  TaskState, 
  TaskFilters, 
  TaskSortBy, 
  TaskStats, 
  TaskAction 
} from '../types/taskContext';
export type { TaskContextType } from './TaskContextTypes';