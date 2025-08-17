import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId?: string;
  data: unknown;
  timestamp: number;
  retry: number;
}

export interface UseOfflineReturn {
  isOnline: boolean;
  isConnected: boolean;
  pendingActions: OfflineAction[];
  queueOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retry'>) => void;
  syncPendingActions: () => Promise<void>;
  clearPendingActions: () => void;
  enableOfflineMode: () => Promise<void>;
  disableOfflineMode: () => Promise<void>;
}

const OFFLINE_QUEUE_KEY = 'moonwave_offline_queue';
const MAX_RETRY_ATTEMPTS = 3;

export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(true);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (saved) {
      try {
        const actions = JSON.parse(saved);
        setPendingActions(actions);
      } catch {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      }
    }
  }, []);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  const executeAction = useCallback(async (action: OfflineAction): Promise<void> => {
    const { collection: collectionName, type, docId, data } = action;
    
    // Import Firestore functions dynamically to avoid circular dependencies
    const { 
      collection, 
      addDoc, 
      updateDoc, 
      deleteDoc, 
      doc 
    } = await import('firebase/firestore');

    switch (type) {
      case 'create':
        await addDoc(collection(db, collectionName), data as Record<string, any>);
        break;
      
      case 'update':
        if (!docId) throw new Error('Document ID required for update');
        await updateDoc(doc(db, collectionName, docId), data as Record<string, any>);
        break;
      
      case 'delete':
        if (!docId) throw new Error('Document ID required for delete');
        await deleteDoc(doc(db, collectionName, docId));
        break;
      
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }, []);

  const syncPendingActions = useCallback(async (): Promise<void> => {
    if (!isOnline || pendingActions.length === 0) return;

    for (const action of pendingActions) {
      try {
        // Attempt to execute the action
        await executeAction(action);
        
        // Remove successful action from queue
        setPendingActions(prev => prev.filter(a => a.id !== action.id));
        
      } catch {
        // Increment retry count
        const updatedAction = { ...action, retry: action.retry + 1 };
        
        if (updatedAction.retry >= MAX_RETRY_ATTEMPTS) {
          // Remove failed action after max retries
          setPendingActions(prev => prev.filter(a => a.id !== action.id));
        } else {
          // Update retry count
          setPendingActions(prev => 
            prev.map(a => a.id === action.id ? updatedAction : a)
          );
        }
      }
    }
  }, [isOnline, pendingActions, executeAction]);

  const queueOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retry'>) => {
    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retry: 0,
    };

    setPendingActions(prev => [...prev, offlineAction]);
  }, []);

  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }, []);

  const enableOfflineMode = useCallback(async (): Promise<void> => {
    try {
      await disableNetwork(db);
      setIsConnected(false);
    } catch {
      // Handle error silently
    }
  }, []);

  const disableOfflineMode = useCallback(async (): Promise<void> => {
    try {
      await enableNetwork(db);
      setIsConnected(true);
    } catch {
      // Handle error silently
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsConnected(true);
      
      // Re-enable Firestore network
      try {
        await enableNetwork(db);
      } catch {
        // Handle error silently
      }

      // Sync pending actions when coming back online
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    };

    const handleOffline = async () => {
      setIsOnline(false);
    };

    // Check Firestore connection status
    const checkFirestoreConnection = () => {
      // Simple connectivity test - you might want to implement a more sophisticated check
      fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache' 
      })
        .then(() => setIsConnected(true))
        .catch(() => setIsConnected(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection periodically
    const connectionCheck = setInterval(checkFirestoreConnection, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheck);
    };
  }, [pendingActions.length, syncPendingActions]);

  return {
    isOnline,
    isConnected,
    pendingActions,
    queueOfflineAction,
    syncPendingActions,
    clearPendingActions,
    enableOfflineMode,
    disableOfflineMode,
  };
};

// Higher-order component to wrap operations with offline support
export const withOfflineSupport = <T extends (...args: unknown[]) => Promise<unknown>>(
  operation: T,
  offlineAction: Omit<OfflineAction, 'id' | 'timestamp' | 'retry'>
): T => {
  return ((...args: unknown[]) => {
    const { isOnline, queueOfflineAction } = useOffline();
    
    if (!isOnline) {
      // Queue action for later execution
      queueOfflineAction(offlineAction);
      return Promise.resolve();
    }
    
    return operation(...args);
  }) as T;
};