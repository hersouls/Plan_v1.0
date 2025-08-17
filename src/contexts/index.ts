export { AuthProvider } from './AuthContext';
export { DataProvider } from './DataContext';
export { AppProvider } from './AppContext';
export { TaskProvider } from './TaskContext';

// Re-export hooks from hooks folder
export { useAuth } from '../hooks/useAuth';
export { useApp } from '../hooks/useApp';
export { useData } from '../hooks/useData';
export { useTaskContext as useTask } from '../hooks/useTask';

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
