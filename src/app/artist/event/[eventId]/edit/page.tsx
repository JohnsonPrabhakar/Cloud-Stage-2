'use client';
import EventForm from '@/app/artist/event/form/page';

export default function EditEventPage({ params: { eventId } }: { params: { eventId: string } }) {
    return <EventForm eventId={eventId} />;
}
