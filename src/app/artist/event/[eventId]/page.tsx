'use client';
import { useParams } from 'next/navigation';
import EventForm from '@/app/artist/event/form/page';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  return <EventForm eventId={eventId} />;
}
