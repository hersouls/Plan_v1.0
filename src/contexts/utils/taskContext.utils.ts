import React from 'react';
import { TaskContext } from '../TaskContext';

// Hook to use TaskContext
export function useTask() {
  const context = React.useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}