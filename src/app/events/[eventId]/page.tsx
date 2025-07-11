import Header from '@/components/layout/Header';
import EventDetailClient from './EventDetailClient';
import type { Event } from '@/lib/types';
import { getEventById } from '@/lib/events';

// This is now a Server Component. It can safely access params.
export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  // Fetch the event data on the server.
  const event = await getEventById(params.eventId);
  
  return (
    <>
      <Header />
      {/* Pass the fetched event data to the Client Component as a prop. */}
      <EventDetailClient event={event} />
    </>
  );
}
