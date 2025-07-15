
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

  // Function to dynamically update event statuses
  const updateDynamicEventStatuses = (currentEvents: Event[]): Event[] => {
    const now = new Date();
    return currentEvents.map(event => {
      // We only want to dynamically update events that are managed by time
      if (event.status === 'Upcoming' || event.status === 'Live' || event.status === 'Approved') {
        const eventDate = new Date(event.date);
        const eventEndDate = new Date(eventDate.getTime() + (event.duration || 0) * 60000);

        if (now > eventEndDate) {
          return { ...event, status: 'Past' };
        } else if (now >= eventDate && now <= eventEndDate) {
          return { ...event, status: 'Live' };
        }
      }
      // Return the event as-is if it's Pending, Rejected, or already Past
      return event;
    });
  };

  useEffect(() => {
    let initialEvents: Event[] = [];
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        initialEvents = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error("Failed to parse events from localStorage, initializing with empty array.", error);
      initialEvents = [];
    }
    
    // Update statuses on initial load
    const updatedEvents = updateDynamicEventStatuses(initialEvents);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));

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
