'use client';
import { useTickets } from '@/hooks/useTickets';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { useRouter } from 'next/navigation';

export default function MyTicketsPageClient() {
    const { purchasedTickets } = useTickets();
    const { events } = useEvents();
    const { user } = useAuth();
    const router = useRouter();

    const myEvents = events.filter(event => 
        purchasedTickets.some(ticket => ticket.eventId === event.id && ticket.userEmail === user?.email)
    );

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
             <div className="space-y-4 text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">My Tickets</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Here are all the events for which you have a ticket. Click "Watch Now" to join the stream.
                </p>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myEvents.length > 0 ? (
                    myEvents.map(event => <EventCard key={event.id} event={event} />)
                ) : (
                    <p className="col-span-full text-center text-muted-foreground">You haven't purchased any tickets yet.</p>
                )}
            </div>
        </main>
    )
}
