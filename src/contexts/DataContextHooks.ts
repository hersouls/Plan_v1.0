import React from 'react';
import { DataContext } from './DataContextTypes';

// Hook to use the data context
export function useData() {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}