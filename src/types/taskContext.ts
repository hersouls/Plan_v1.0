import { Task, TaskStatus } from './task';

// Task State Interface
export interface TaskState {
  // Tasks data
  tasks: Task[];
  filteredTasks: Task[];
  
  // Current task details
  selectedTask: Task | null;
  selectedTaskId: string | null;
  
  // Filters and sorting
  filters: TaskFilters;
  sortBy: TaskSortBy;
  sortOrder: 'asc' | 'desc';
  
  // UI state
  viewMode: 'list' | 'grid' | 'calendar';
  showCompleted: boolean;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Statistics
  stats: TaskStats;
}

export interface TaskFilters {
  status?: TaskStatus[];
  assigneeId?: string[];
  priority?: string[];
  category?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery: string;
  tags?: string[];
}

export type TaskSortBy = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completionRate: number;
}

// Action Types
export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'SET_SELECTED_TASK'; payload: { task: Task | null; taskId?: string | null } }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: { sortBy: TaskSortBy; sortOrder?: 'asc' | 'desc' } }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'calendar' }
  | { type: 'TOGGLE_SHOW_COMPLETED' }
  | { type: 'SET_SHOW_COMPLETED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPLY_FILTERS_AND_SORT' };

// Initial State
export const initialFilters: TaskFilters = {
  searchQuery: '',
};

export const initialState: TaskState = {
  tasks: [],
  filteredTasks: [],
  selectedTask: null,
  selectedTaskId: null,
  filters: initialFilters,
  sortBy: 'dueDate',
  sortOrder: 'asc',
  viewMode: 'list',
  showCompleted: true,
  loading: false,
  error: null,
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0,
    completionRate: 0,
  },
};