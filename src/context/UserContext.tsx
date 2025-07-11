'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User as RegisteredUser } from '@/lib/users';
import { dummyUsers } from '@/lib/users';

interface UserContextType {
  users: RegisteredUser[];
  addUser: (user: RegisteredUser) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        try {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setUsers(parsed);
            } else {
                setUsers(dummyUsers);
                localStorage.setItem('users', JSON.stringify(dummyUsers));
            }
        } catch (error) {
            console.error("Failed to parse users from localStorage, using dummy data.", error);
            setUsers(dummyUsers);
            localStorage.setItem('users', JSON.stringify(dummyUsers));
        }
    } else {
        setUsers(dummyUsers);
        localStorage.setItem('users', JSON.stringify(dummyUsers));
    }
  }, []);

  const updateUsersInStorage = (updatedUsers: RegisteredUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const addUser = (user: RegisteredUser) => {
    const updatedUsers = [user, ...users];
    updateUsersInStorage(updatedUsers);
  };

  return (
    <UserContext.Provider value={{ users, addUser }}>
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
