export { AuthProvider } from './AuthContext';
export { DataProvider } from './DataContext';
export { AppProvider } from './AppContext';
export { TaskProvider } from './TaskContext';

// Re-export hooks from hooks folder
export { useAuth } from '../hooks/useAuth';
export { useApp } from '../hooks/useApp';
export { useData } from './utils/dataContext.utils';
export { useTask } from './utils/taskContext.utils';

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
export type { DataContextType } from './DataContextTypes';
export type { TaskContextType } from './TaskContextTypes';
