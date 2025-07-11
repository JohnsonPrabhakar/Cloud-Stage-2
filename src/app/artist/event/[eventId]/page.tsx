'use client';
import EventForm from '@/app/artist/event/EventForm';

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const eventId = params.eventId;

  return <EventForm eventId={eventId} />;
}
