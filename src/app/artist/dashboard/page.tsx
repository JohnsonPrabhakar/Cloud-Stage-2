'use client';

import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Share2 } from 'lucide-react';

export default function ArtistDashboard() {
  const { events } = useEvents();
  const { user } = useAuth();

  const artistEvents = events.filter(e => e.artistEmail === user?.email);

  const now = new Date();
  const upcomingEvents = artistEvents.filter(e => new Date(e.date) > now && e.status !== 'Past');
  const liveEvents = artistEvents.filter(e => e.status === 'Live');
  const pastEvents = artistEvents.filter(e => e.status === 'Past');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline">Welcome, Artist!</h1>
          <p className="text-muted-foreground">Here are your events. Manage them or create a new one.</p>
        </div>
        <Button asChild>
          <Link href="/artist/create-event">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-headline mb-4">Live Events</h2>
          {liveEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no live events.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-headline mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event}>
                    <div className="flex justify-between items-center w-full">
                       {event.isBoosted && <Badge variant="outline" className="text-accent border-accent">Boosted</Badge>}
                       <div className="flex gap-2 ml-auto">
                         <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
                         <Button variant="outline" size="icon"><Share2 className="h-4 w-4"/></Button>
                       </div>
                    </div>
                </EventCard>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no upcoming events.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-headline mb-4">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no past events.</p>
          )}
        </section>
      </div>
    </div>
  );
}
