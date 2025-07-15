
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Event, EventStatus } from '@/lib/types';
import { dummyEvents } from '@/lib/events';

interface EventContextType {
  events: Event[];
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  giveThumbsUp: (eventId: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        try {
            const parsedEvents = JSON.parse(storedEvents);
            setEvents(parsedEvents);
        } catch (error) {
            console.error("Failed to parse events from localStorage, initializing with empty array.", error);
            setEvents([]);
        }
    } else {
        // Start with an empty array if no events are in storage
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
    const newEventWithThumbs = { ...event, thumbsUp: 0 };
    const updatedEvents = [newEventWithThumbs, ...events];
    updateEventsInStorage(updatedEvents);
  };
  
  const updateEvent = (updatedEventData: Event) => {
    const updatedEvents = events.map(event =>
      event.id === updatedEventData.id ? updatedEventData : event
    );
    updateEventsInStorage(updatedEvents);
  };
  
  const giveThumbsUp = (eventId: string) => {
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...event, thumbsUp: (event.thumbsUp || 0) + 1 } : event
    );
    updateEventsInStorage(updatedEvents);
  };

  return (
    <EventContext.Provider value={{ events, updateEventStatus, addEvent, updateEvent, giveThumbsUp }}>
      {children}
    </EventContext.Provider>
  );
}
