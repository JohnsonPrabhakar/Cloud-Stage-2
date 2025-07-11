'use client';
import { useParams } from 'next/navigation';
import EventForm from '@/app/artist/event/EventForm';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // Pass only the eventId string, not the whole params object.
  return <EventForm eventId={eventId} />;
}
