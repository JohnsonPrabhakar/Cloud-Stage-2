
'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import type { Event } from '@/lib/types';
import { Separator } from '@/components/ui/separator';


function EventGridSection({ title, events }: { title: string; events: Event[] }) {
    if (events.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
        </section>
    );
}

export default function EventsPageClient() {
  const { events } = useEvents();

  const liveEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live');
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.status === 'Upcoming' || e.status === 'Approved');
  }, [events]);

  const pastEvents = useMemo(() => {
    return events.filter(e => e.status === 'Past');
  }, [events]);

  const allEventsCount = liveEvents.length + upcomingEvents.length + pastEvents.length;

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">All Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover what's happening on CloudStage. Your next favorite live experience awaits.
            </p>
        </div>

        <div className="space-y-12">
            {allEventsCount > 0 ? (
                <>
                    <EventGridSection title="Live Now" events={liveEvents} />
                    {liveEvents.length > 0 && <Separator />}
                    <EventGridSection title="Upcoming" events={upcomingEvents} />
                    {upcomingEvents.length > 0 && <Separator />}
                    <EventGridSection title="Past Events" events={pastEvents} />
                </>
            ) : (
                <div className="col-span-full text-center text-muted-foreground py-16">
                    <h2 className="text-2xl font-semibold">No Events Found</h2>
                    <p>There are no events scheduled at the moment. Please check back later!</p>
                </div>
            )}
        </div>
      </main>
  );
}
