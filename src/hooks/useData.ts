import { useContext } from 'react';
import { DataContext } from '../contexts/DataContextDef';

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}