
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from '@/components/EventCard';

export default function Home() {
  const { events } = useEvents();

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Past' || e.status === 'Approved');
  }, [events]);

  const liveEvents = useMemo(() => approvedEvents.filter(e => e.status === 'Live'), [approvedEvents]);
  const upcomingEvents = useMemo(() => approvedEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved'), [approvedEvents]);
  const pastEvents = useMemo(() => approvedEvents.filter(e => e.status === 'Past'), [approvedEvents]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/60 -z-10" />
            <div className="container px-4 md:px-6 z-10">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                        Your Stage, Your Audience, Your World.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-foreground/80">
                        Experience live events like never before. From intimate acoustic sets to global workshops, CloudStage brings the world to you.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg">
                            <Link href="/events">Explore Events</Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/login">Become an Artist</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="events" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Featured Events</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out what's happening on CloudStage. Your next favorite event is just a click away.
                </p>
              </div>
            </div>
            <Tabs defaultValue="upcoming" className="mt-10">
              <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              <TabsContent value="live" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {liveEvents.length > 0 ? (
                        liveEvents.map((event) => <EventCard key={event.id} event={event} />)
                    ) : <p className="col-span-full text-center text-muted-foreground">No live events right now. Check back soon!</p>}
                </div>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.slice(0, 8).map((event) => <EventCard key={event.id} event={event} />)
                     ) : <p className="col-span-full text-center text-muted-foreground">No upcoming events scheduled.</p>}
                </div>
              </TabsContent>
              <TabsContent value="past" className="mt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {pastEvents.length > 0 ? (
                        pastEvents.slice(0, 4).map((event) => <EventCard key={event.id} event={event} />)
                     ) : <p className="col-span-full text-center text-muted-foreground">No past events found.</p>}
                </div>
              </TabsContent>
            </Tabs>
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
