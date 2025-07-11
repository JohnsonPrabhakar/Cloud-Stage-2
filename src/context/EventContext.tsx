'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Event, EventStatus } from '@/lib/types';

interface EventContextType {
  events: Event[];
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  addEvent: (event: Event) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        // If no events in storage, start with an empty array
        localStorage.setItem('events', JSON.stringify([]));
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to parse events from localStorage", error);
      localStorage.setItem('events', JSON.stringify([])); // Reset if parsing fails
      setEvents([]);
    }
  }, []);

  const updateEventsInStorage = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };
  
  const updateEventStatus = (eventId: string, status: EventStatus) => {
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...event, status } : event
    );
    updateEventsInStorage(updatedEvents);
  };

  const addEvent = (event: Event) => {
    const updatedEvents = [event, ...events];
    updateEventsInStorage(updatedEvents);
  };

  return (
    <EventContext.Provider value={{ events, updateEventStatus, addEvent }}>
      {children}
    </EventContext.Provider>
  );
}
