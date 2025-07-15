
'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function EventCarousel({ title, events }: { title: string; events: any[] }) {
    if (events.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-16">
          <h2 className="text-2xl font-semibold">No {title.toLowerCase()}</h2>
          <p>Check back later for more events.</p>
        </div>
      )
    }

    return (
        <section className="w-full py-4 md:py-6">
            <h2 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl mb-6 sr-only">{title}</h2>
            <div className="relative">
                <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} className="w-56 md:w-64" />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </section>
    );
}

const promoSlides = [
    {
        id: 1,
        title: "Experience the Best of Live Music",
        image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop",
        hint: "concert crowd"
    },
    {
        id: 2,
        title: "Unmissable Theatre & Comedy Shows",
        image: "https://images.unsplash.com/photo-1504333638930-c8787321e06e?q=80&w=2070&auto=format&fit=crop",
        hint: "theatre stage"
    },
    {
        id: 3,
        title: "Mindful Yoga & Wellness Events",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop",
        hint: "yoga meditation"
    },
    {
        id: 4,
        title: "Stream Your Favorite Indie Movies",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
        hint: "movie projector"
    },
    {
        id: 5,
        title: "Events Curated Just for You",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2062&auto=format&fit=crop",
        hint: "abstract event"
    },
    {
        id: 6,
        title: "Discover Workshops & Learning",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
        hint: "workshop learning"
    },
];

function HeroCarousel() {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  return (
    <Carousel 
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {promoSlides.map((slide) => (
          <CarouselItem key={slide.id}>
            <Card className="border-none overflow-hidden">
              <CardContent className="flex aspect-[16/7] md:aspect-[16/6] items-center justify-center p-0 relative">
                <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill
                    className="object-cover" 
                    data-ai-hint={slide.hint}
                />
                <div className="absolute inset-0 bg-black/50" />
                <h2 className="relative text-2xl md:text-4xl lg:text-5xl font-headline font-bold text-white text-center p-4 z-10 animate-fade-in-up">
                    {slide.title}
                </h2>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
    </Carousel>
  );
}


export default function Home() {
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

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="w-full">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-2 text-center my-6">
                    <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Welcome to CloudStage</h1>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">Discover virtual concerts from around the globe.</p>
                </div>
            </div>
        </section>
        
        <section className="w-full pb-6">
            <div className="container px-4 md:px-6">
                 <HeroCarousel />
            </div>
        </section>

        <section id="events" className="w-full py-6 md:py-8 bg-secondary/20">
          <div className="container px-4 md:px-6">
             <Tabs defaultValue="live" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                    <TabsTrigger value="live">Live Now ({liveEvents.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
                    <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="live">
                    <EventCarousel title="Live Events" events={liveEvents} />
                </TabsContent>
                <TabsContent value="upcoming">
                    <EventCarousel title="Upcoming Events" events={upcomingEvents} />
                </TabsContent>
                <TabsContent value="past">
                    <EventCarousel title="Past Events" events={pastEvents} />
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
