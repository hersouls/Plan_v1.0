import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(state) : value;
        setState(valueToStore);
        window.localStorage.setItem(key, serialize(valueToStore));
      } catch (error) {
        // Handle error silently
      }
    },
    [key, serialize]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
        // Handle error silently
      }
  }, [key, defaultValue]);

  // Listen for changes to this key in other windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(deserialize(e.newValue));
        } catch (error) {
        // Handle error silently
      }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [state, setValue, removeValue] as const;
}