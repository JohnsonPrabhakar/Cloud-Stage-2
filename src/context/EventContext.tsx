'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Event, EventStatus } from '@/lib/types';
import { dummyEvents } from '@/lib/events';

interface EventContextType {
  events: Event[];
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        try {
            const parsedEvents = JSON.parse(storedEvents);
            if(Array.isArray(parsedEvents) && parsedEvents.length > 0){
                setEvents(parsedEvents);
            } else {
                 setEvents(dummyEvents);
                 localStorage.setItem('events', JSON.stringify(dummyEvents));
            }
        } catch (error) {
            console.error("Failed to parse events from localStorage, using dummy data.", error);
            setEvents(dummyEvents);
            localStorage.setItem('events', JSON.stringify(dummyEvents));
        }
    } else {
        setEvents(dummyEvents);
        localStorage.setItem('events', JSON.stringify(dummyEvents));
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
  
  const updateEvent = (updatedEventData: Event) => {
    const updatedEvents = events.map(event =>
      event.id === updatedEventData.id ? updatedEventData : event
    );
    updateEventsInStorage(updatedEvents);
  };

  return (
    <EventContext.Provider value={{ events, updateEventStatus, addEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
}
