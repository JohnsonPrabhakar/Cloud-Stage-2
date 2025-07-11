import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';
import type { Event } from '@/lib/types';

// This is a placeholder for a real data fetching function
async function getEvent(eventId: string): Promise<Event | undefined> {
  // In a real app, you'd fetch this from your database.
  // For now, we'll simulate it by importing dummy data.
  const { dummyEvents } = await import('@/lib/events');
  return dummyEvents.find(e => e.id === eventId);
}

export default async function PurchasePage({ params }: { params: { eventId: string } }) {
  const event = await getEvent(params.eventId);

  return (
    <>
      <Header />
      <PurchasePageClient event={event} />
    </>
  );
}
