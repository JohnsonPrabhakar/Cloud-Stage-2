'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import EventDetailClient from './EventDetailClient';
import type { Event } from '@/lib/types';
import { useEvents } from '@/hooks/useEvents';

export default function EventDetailPage() {
  const { events } = useEvents();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (events.length > 0 && eventId) {
      const foundEvent = events.find(e => e.id === eventId);
      setEvent(foundEvent);
      setLoading(false);
    }
  }, [events, eventId]);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading event...</p>
        </div>
    );
  }

  return (
    <>
      <Header />
      <EventDetailClient event={event} />
    </>
  );
}
