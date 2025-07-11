'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { PurchasedTicket, GuestDetails } from '@/lib/types';


interface TicketContextType {
  purchasedTickets: PurchasedTicket[];
  purchaseTicket: (eventId: string, userEmail: string, guestDetails?: GuestDetails) => void;
  hasTicket: (eventId: string) => boolean;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);

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

  const purchaseTicket = (eventId: string, userEmail: string, guestDetails?: GuestDetails) => {
    const newTicket: PurchasedTicket = {
        eventId,
        userEmail,
        purchaseDate: new Date().toISOString(),
        guestDetails
    };
    const updatedTickets = [...purchasedTickets, newTicket];
    updateTicketsInStorage(updatedTickets);
  };

  const hasTicket = (eventId: string) => {
    return purchasedTickets.some(ticket => ticket.eventId === eventId);
  }

  return (
    <TicketContext.Provider value={{ purchasedTickets, purchaseTicket, hasTicket }}>
      {children}
    </TicketContext.Provider>
  );
}
