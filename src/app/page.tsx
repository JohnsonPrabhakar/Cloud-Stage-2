
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_LANGUAGES } from '@/lib/events';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function EventCarousel({ title, events }: { title: string; events: any[] }) {
    if (events.length === 0) return null;

    return (
        <section className="w-full py-4 md:py-6">
            <h2 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl mb-6">{title}</h2>
            <div className="relative">
                <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} className="w-56" />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </section>
    );
}


export default function Home() {
  const { events } = useEvents();

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Approved');
  }, [events]);

  const liveEvents = useMemo(() => approvedEvents.filter(e => e.status === 'Live'), [approvedEvents]);
  const upcomingEvents = useMemo(() => approvedEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved'), [approvedEvents]);
  const pastEvents = useMemo(() => events.filter(e => e.status === 'Past'), [events]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="w-full py-6 md:py-8">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Welcome to CloudStage</h1>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">Discover virtual concerts from around the globe.</p>
                </div>
                <div className="mt-8 mx-auto w-full max-w-4xl space-y-4">
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title or artist..."
                            className="w-full pl-10 h-12"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Select>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Filter by language" />
                            </SelectTrigger>
                            <SelectContent>
                               {EVENT_LANGUAGES.map(lang => <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </section>

        <section id="events" className="w-full py-6 md:py-8 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <EventCarousel title="Live Events" events={liveEvents} />
            <EventCarousel title="Upcoming Events" events={upcomingEvents} />
            <EventCarousel title="Past Events" events={pastEvents} />
             <div className="text-center mt-12">
                <Button asChild variant="outline">
                    <Link href="/events">View All Events</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
