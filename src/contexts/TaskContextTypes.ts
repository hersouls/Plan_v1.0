import { createContext } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types/task';
import { TaskState, TaskFilters, TaskSortBy } from '../types/taskContext';

export interface TaskContextType {
  state: TaskState;
  
  // Task operations
  createTask: (data: Omit<CreateTaskInput, 'userId' | 'groupId'>) => Promise<void>;
  updateTask: (taskId: string, updates: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  
  // Task selection
  selectTask: (task: Task | null, taskId?: string) => void;
  
  // Filtering and sorting
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setSort: (sortBy: TaskSortBy, sortOrder?: 'asc' | 'desc') => void;
  
  // View options
  setViewMode: (mode: 'list' | 'grid' | 'calendar') => void;
  toggleShowCompleted: () => void;
  setShowCompleted: (show: boolean) => void;
  
  // Utility functions
  getTodayTasks: () => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  refreshTasks: () => Promise<void>;
}

// Create Context
export const TaskContext = createContext<TaskContextType | undefined>(undefined);