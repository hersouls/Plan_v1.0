import { createContext } from 'react';
import { AppContextType } from './AppContext';

export const AppContext = createContext<AppContextType | undefined>(undefined);