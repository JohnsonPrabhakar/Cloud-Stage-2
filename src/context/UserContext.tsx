
'use client';

import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import type { User as RegisteredUser, Subscription } from '@/lib/users';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { add } from 'date-fns';

interface UserContextType {
  users: RegisteredUser[];
  addUser: (user: RegisteredUser) => void;
  updateUser: (user: RegisteredUser) => void;
  subscribeUser: (email: string) => Promise<void>;
  incrementEventCount: (email: string) => Promise<void>;
  checkAndResetSubscription: (user: RegisteredUser) => RegisteredUser;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as RegisteredUser);
        setUsers(usersData);
    };
    fetchUsers();
  }, []);

  const findUserByEmail = (email: string) => users.find(u => u.email === email);
  
  const addUser = async (user: RegisteredUser) => {
    // This function is now mostly handled by AuthContext register flow
    // but kept for potential direct use.
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, user);
    setUsers(prev => [...prev, user]);
  };
  
  const updateUser = async (updatedUserData: RegisteredUser) => {
    const userRef = doc(db, "users", updatedUserData.id);
    await updateDoc(userRef, { ...updatedUserData });
    setUsers(users.map(user => 
      user.id === updatedUserData.id ? updatedUserData : user
    ));
  };
  
  const subscribeUser = async (email: string) => {
    const userToUpdate = findUserByEmail(email);
    if (!userToUpdate) return;
    
    const now = new Date();
    const newSubscription: Subscription = {
        planType: 'premium',
        startDate: now.toISOString(),
        expiryDate: add(now, { days: 30 }).toISOString(),
        eventCount: 0,
    };
    const userRef = doc(db, "users", userToUpdate.id);
    await updateDoc(userRef, { subscription: newSubscription });
    setUsers(prev => prev.map(u => u.id === userToUpdate.id ? {...u, subscription: newSubscription} : u));
  };
  
  const incrementEventCount = async (email: string) => {
    const userToUpdate = findUserByEmail(email);
    if (!userToUpdate || !userToUpdate.subscription) return;

    const newEventCount = userToUpdate.subscription.eventCount + 1;
    const userRef = doc(db, "users", userToUpdate.id);
    await updateDoc(userRef, { 'subscription.eventCount': newEventCount });
    setUsers(prev => prev.map(u => u.id === userToUpdate.id && u.subscription ? {...u, subscription: {...u.subscription, eventCount: newEventCount}} : u));
  };

  const checkAndResetSubscription = (user: RegisteredUser): RegisteredUser => {
    if (user.subscription && new Date(user.subscription.expiryDate) < new Date()) {
      const updatedUser = { ...user, subscription: null };
      const userRef = doc(db, "users", user.id);
      updateDoc(userRef, { subscription: null });
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
export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
