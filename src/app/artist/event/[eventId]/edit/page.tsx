'use client';
import EventForm from '@/app/artist/event/form/page';
import { useParams } from 'next/navigation';

export default function EditEventPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    return <EventForm eventId={eventId} />;
}
