
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';

interface AppStatusContextType {
  isOnline: boolean;
  toggleAppStatus: () => void;
  isLoading: boolean;
}

export const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined);

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('appIsOnline');
      if (storedStatus !== null) {
        setIsOnline(JSON.parse(storedStatus));
      }
    } catch (error) {
      console.error("Failed to parse app status from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const toggleAppStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
        localStorage.setItem('appIsOnline', JSON.stringify(newStatus));
    } catch (error) {
        console.error("Failed to save app status to localStorage", error);
    }
  };

  return (
    <AppStatusContext.Provider value={{ isOnline, toggleAppStatus, isLoading }}>
      {children}
    </AppStatusContext.Provider>
  );
}
