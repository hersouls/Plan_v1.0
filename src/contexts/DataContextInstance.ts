import { createContext } from 'react';
import { DataContextType } from './DataContextTypes';

export const DataContext = createContext<DataContextType | undefined>(undefined);