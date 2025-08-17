import { useContext } from 'react';
import { TaskContext, TaskContextType } from '../contexts/TaskContext';

// Hook to use Task Context
export function useTask(): TaskContextType {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}