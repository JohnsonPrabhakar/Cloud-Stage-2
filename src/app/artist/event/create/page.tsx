'use client';
import EventForm from '@/app/artist/event/form/page';
import { useParams } from 'next/navigation';

export default function CreateOrEditEventPage() {
    const params = useParams();
    const eventId = params.eventId as string | undefined;
    return <EventForm eventId={eventId} />;
}
