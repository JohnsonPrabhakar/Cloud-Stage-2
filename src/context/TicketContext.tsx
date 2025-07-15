
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { PurchasedTicket } from '@/lib/types';
import { useUsers } from './UserContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';

interface TicketContextType {
  purchasedTickets: PurchasedTicket[];
  purchaseTicket: (eventId: string, userEmail: string, isPremium?: boolean) => void;
  hasTicket: (eventId: string, userEmail?: string | null) => boolean;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const { incrementEventCount } = useUsers();

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(collection(db, "tickets"), where("userId", "==", auth.currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ticketsData: PurchasedTicket[] = [];
        querySnapshot.forEach((doc) => {
          ticketsData.push({ id: doc.id, ...doc.data() } as PurchasedTicket);
        });
        setPurchasedTickets(ticketsData);
      });
      return () => unsubscribe();
    } else {
        setPurchasedTickets([]);
    }
  }, [auth.currentUser]);

  const purchaseTicket = async (eventId: string, userEmail: string, isPremium: boolean = false) => {
    if (!auth.currentUser) return;
    if (hasTicket(eventId, userEmail)) return;

    if(isPremium) {
        await incrementEventCount(userEmail);
    }

    await addDoc(collection(db, "tickets"), {
      eventId,
      userId: auth.currentUser.uid,
      userEmail,
      purchaseDate: serverTimestamp(),
      subscriptionUsed: isPremium,
    });
  };

  const hasTicket = (eventId: string, userEmail?: string | null) => {
    if (userEmail) {
        return purchasedTickets.some(ticket => ticket.eventId === eventId && ticket.userEmail === userEmail);
    }
    return false;
  }

  return (
    <TicketContext.Provider value={{ purchasedTickets, purchaseTicket, hasTicket }}>
      {children}
    </TicketContext.Provider>
  );
}
