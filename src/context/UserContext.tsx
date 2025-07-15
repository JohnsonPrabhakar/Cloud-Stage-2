
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User as RegisteredUser } from '@/lib/users';
import { dummyUsers } from '@/lib/users';

const LOCALSTORAGE_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB

interface UserContextType {
  users: RegisteredUser[];
  addUser: (user: RegisteredUser) => void;
  updateUser: (user: RegisteredUser) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        try {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed)) {
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
    try {
        const stringifiedValue = JSON.stringify(updatedUsers);
        if (stringifiedValue.length > LOCALSTORAGE_SIZE_LIMIT) {
             console.error(
                `Error setting localStorage key “users”: Data size (${stringifiedValue.length}) exceeds limit. A large object (like a file) was likely passed unintentionally.`
             );
             // We still update the state in memory, but don't save to localStorage to prevent crashing.
             setUsers(updatedUsers);
             return; 
        }
        setUsers(updatedUsers);
        localStorage.setItem('users', stringifiedValue);
    } catch (error) {
        console.error(`Error setting localStorage key “users”:`, error);
    }
  };

  const addUser = (user: RegisteredUser) => {
    const updatedUsers = [user, ...users];
    updateUsersInStorage(updatedUsers);
  };
  
  const updateUser = (updatedUserData: RegisteredUser) => {
    const updatedUsers = users.map(user => 
      user.email === updatedUserData.email ? updatedUserData : user
    );
    updateUsersInStorage(updatedUsers);
  };

  return (
    <UserContext.Provider value={{ users, addUser, updateUser }}>
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
