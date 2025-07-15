
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Event, EventStatus } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  giveThumbsUp: (eventId: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date();
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as Event;
        data.id = doc.id;
        
        // Dynamic Status Update Logic
        const eventDate = new Date(data.date);
        const eventEndDate = new Date(eventDate.getTime() + (data.duration || 0) * 60000);

        if (data.status === 'Approved' || data.status === 'Upcoming' || data.status === 'Live') {
          if (now > eventEndDate) {
            data.status = 'Past';
          } else if (now >= eventDate && now <= eventEndDate) {
            data.status = 'Live';
          } else {
            data.status = 'Upcoming';
          }
        }
        return data;
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const updateEventStatus = async (eventId: string, status: EventStatus) => {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { status });
  };

  const addEvent = async (event: Omit<Event, 'id'>) => {
    await addDoc(collection(db, "events"), {
      ...event,
      thumbsUp: 0,
      createdAt: serverTimestamp()
    });
  };
  
  const updateEvent = async (updatedEventData: Event) => {
    const eventRef = doc(db, "events", updatedEventData.id);
    const dataToUpdate = { ...updatedEventData };
    delete (dataToUpdate as any).id; // don't save id field inside doc
    await updateDoc(eventRef, dataToUpdate);
  };
  
  const giveThumbsUp = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      thumbsUp: (event.thumbsUp || 0) + 1
    });
  };

  return (
    <EventContext.Provider value={{ events, updateEventStatus, addEvent, updateEvent, giveThumbsUp }}>
      {children}
    </EventContext.Provider>
  );
}
