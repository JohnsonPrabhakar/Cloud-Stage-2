'use client';

import { createContext, useState, type ReactNode } from 'react';
import type { Event, EventStatus } from '@/lib/types';
import { dummyEvents } from '@/lib/events';

interface EventContextType {
  events: Event[];
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  addEvent: (event: Event) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(dummyEvents);

  const updateEventStatus = (eventId: string, status: EventStatus) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, status } : event
      )
    );
  };

  const addEvent = (event: Event) => {
    setEvents(prevEvents => [event, ...prevEvents]);
  };

  return (
    <EventContext.Provider value={{ events, updateEventStatus, addEvent }}>
      {children}
    </EventContext.Provider>
  );
}
