'use client';
import EventForm from '../form/page';
export default function EditEventPage({ params }: { params: { eventId: string } }) {
    return <EventForm eventId={params.eventId} />;
}
