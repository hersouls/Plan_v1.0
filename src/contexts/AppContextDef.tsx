import { createContext } from 'react';
import { AppContextType } from './AppContextTypes';

export const AppContext = createContext<AppContextType | undefined>(undefined);