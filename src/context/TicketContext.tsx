
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { PurchasedTicket, GuestDetails } from '@/lib/types';
import { useUsers } from './UserContext';


interface TicketContextType {
  purchasedTickets: PurchasedTicket[];
  purchaseTicket: (eventId: string, userEmail: string, guestDetails?: GuestDetails, isPremium?: boolean) => void;
  hasTicket: (eventId: string, userEmail?: string | null) => boolean;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const { incrementEventCount } = useUsers();

  useEffect(() => {
    try {
      const storedTickets = localStorage.getItem('purchasedTickets');
      if (storedTickets) {
        setPurchasedTickets(JSON.parse(storedTickets));
      }
    } catch (error) {
      console.error("Failed to parse tickets from localStorage", error);
      localStorage.removeItem('purchasedTickets');
    }
  }, []);

  const updateTicketsInStorage = (updatedTickets: PurchasedTicket[]) => {
    setPurchasedTickets(updatedTickets);
    localStorage.setItem('purchasedTickets', JSON.stringify(updatedTickets));
  };

  const purchaseTicket = (eventId: string, userEmail: string, guestDetails?: GuestDetails, isPremium: boolean = false) => {
    if (hasTicket(eventId, userEmail)) return; // Prevent duplicate tickets

    if(isPremium) {
        incrementEventCount(userEmail);
    }

    const newTicket: PurchasedTicket = {
        eventId,
        userEmail,
        purchaseDate: new Date().toISOString(),
        guestDetails
    };
    const updatedTickets = [...purchasedTickets, newTicket];
    updateTicketsInStorage(updatedTickets);
  };

  const hasTicket = (eventId: string, userEmail?: string | null) => {
    if (userEmail) {
        return purchasedTickets.some(ticket => ticket.eventId === eventId && ticket.userEmail === userEmail);
    }
    // For guest checkout legacy or checks without user context
    return purchasedTickets.some(ticket => ticket.eventId === eventId);
  }

  return (
    <TicketContext.Provider value={{ purchasedTickets, purchaseTicket, hasTicket }}>
      {children}
    </TicketContext.Provider>
  );
}
