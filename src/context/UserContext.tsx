
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User as RegisteredUser, Subscription } from '@/lib/users';
import { dummyUsers } from '@/lib/users';
import { add } from 'date-fns';

const LOCALSTORAGE_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB

// A custom hook to manage state in localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Ensure we don't return null or undefined, which could break destructuring
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      if (typeof window !== 'undefined') {
        const stringifiedValue = JSON.stringify(valueToStore);
        // Safeguard against exceeding quota
        if (stringifiedValue.length > LOCALSTORAGE_SIZE_LIMIT) {
           console.error(
              `Error setting localStorage key “${key}”: Data size (${stringifiedValue.length}) exceeds quota. A large object (like a file) was likely passed unintentionally.`
           );
            // Update state in memory but prevent writing to localStorage to avoid crash
           setStoredValue(valueToStore);
           return;
        }
        window.localStorage.setItem(key, stringifiedValue);
      }
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}


interface UserContextType {
  users: RegisteredUser[];
  addUser: (user: RegisteredUser) => void;
  updateUser: (user: RegisteredUser) => void;
  subscribeUser: (email: string) => void;
  incrementEventCount: (email: string) => void;
  checkAndResetSubscription: (user: RegisteredUser) => RegisteredUser;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<RegisteredUser[]>('users', dummyUsers);
  
  const addUser = (user: RegisteredUser) => {
    setUsers(prevUsers => [{ ...user, subscription: null }, ...prevUsers]);
  };
  
  const updateUser = (updatedUserData: RegisteredUser) => {
    setUsers(users.map(user => 
      user.email === updatedUserData.email ? updatedUserData : user
    ));
  };
  
  const subscribeUser = (email: string) => {
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.email === email) {
              const now = new Date();
              const newSubscription: Subscription = {
                  planType: 'premium',
                  startDate: now.toISOString(),
                  expiryDate: add(now, { days: 30 }).toISOString(),
                  eventCount: 0,
              };
              return { ...user, subscription: newSubscription };
          }
          return user;
      }));
  };
  
  const incrementEventCount = (email: string) => {
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.email === email && user.subscription) {
              const updatedSubscription = {
                  ...user.subscription,
                  eventCount: user.subscription.eventCount + 1,
              };
              return { ...user, subscription: updatedSubscription };
          }
          return user;
      }));
  };

  const checkAndResetSubscription = (user: RegisteredUser): RegisteredUser => {
    if (user.subscription && new Date(user.subscription.expiryDate) < new Date()) {
      const updatedUser = { ...user, subscription: null };
      updateUser(updatedUser);
      return updatedUser;
    }
    return user;
  };


  return (
    <UserContext.Provider value={{ users, addUser, updateUser, subscribeUser, incrementEventCount, checkAndResetSubscription }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the context
import { useContext } from 'react';

export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
