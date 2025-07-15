
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { PurchasedTicket } from '@/lib/types';
import { useUsers } from './UserContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface TicketContextType {
  purchasedTickets: PurchasedTicket[];
  purchaseTicket: (eventId: string, userEmail: string, isPremium?: boolean) => void;
  hasTicket: (eventId: string, userEmail?: string | null) => boolean;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const { incrementEventCount } = useUsers();
  const { user } = useAuth(); // Use the user from our context

  useEffect(() => {
    // Depend on the user object from AuthContext, not auth.currentUser
    if (user?.uid) {
      const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ticketsData: PurchasedTicket[] = [];
        querySnapshot.forEach((doc) => {
          ticketsData.push({ id: doc.id, ...doc.data() } as PurchasedTicket);
        });
        setPurchasedTickets(ticketsData);
      }, (error) => {
        console.error("Firestore snapshot error in TicketContext:", error);
      });
      return () => unsubscribe();
    } else {
        // If there's no user, ensure the tickets list is empty.
        setPurchasedTickets([]);
    }
  }, [user]); // Re-run effect when the user object changes

  const purchaseTicket = async (eventId: string, userEmail: string, isPremium: boolean = false) => {
    if (!user) return; // Guard against purchase attempts when logged out
    if (hasTicket(eventId, userEmail)) return;

    if(isPremium) {
        await incrementEventCount(userEmail);
    }

    await addDoc(collection(db, "tickets"), {
      eventId,
      userId: user.uid,
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
