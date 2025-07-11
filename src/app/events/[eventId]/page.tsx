'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import EventDetailClient from './EventDetailClient';
import type { Event } from '@/lib/types';
import { getEventById } from '@/lib/events'; // Using the new centralized function

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      // Since this is a client component, we simulate an async fetch
      // getEventById will get data from localStorage if available
      const foundEvent = await getEventById(params.eventId);
      setEvent(foundEvent);
      setLoading(false);
    };

    fetchEvent();
  }, [params.eventId]);

  if (loading) {
    return (
        <>
            <Header />
            <div className="container py-12 text-center">
                <p>Loading event...</p>
            </div>
        </>
    );
  }
  
  return (
    <>
      <Header />
      <EventDetailClient event={event} />
    </>
  );
}