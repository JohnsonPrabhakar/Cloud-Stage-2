
'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";
import { useEvents } from '@/hooks/useEvents';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_LANGUAGES } from '@/lib/events';
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

const promoSlides = [
    {
        id: 1,
        title: "Experience the Best of Live Music",
        image: "https://placehold.co/1200x500/800020/459360?text=Live+Music",
        hint: "concert crowd"
    },
    {
        id: 2,
        title: "Unmissable Theatre & Comedy Shows",
        image: "https://placehold.co/1200x500/808000/ffffff?text=Comedy+Shows",
        hint: "theatre stage"
    },
    {
        id: 3,
        title: "Mindful Yoga & Wellness Events",
        image: "https://placehold.co/1200x500/0088FE/ffffff?text=Wellness",
        hint: "yoga meditation"
    },
    {
        id: 4,
        title: "Stream Your Favorite Indie Movies",
        image: "https://placehold.co/1200x500/FF8042/000000?text=Indie+Movies",
        hint: "movie projector"
    },
    {
        id: 5,
        title: "Events Curated Just for You",
        image: "https://placehold.co/1200x500/AF19FF/ffffff?text=For+You",
        hint: "abstract event"
    },
];

function HeroCarousel() {
  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true })
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
                    layout="fill" 
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
        <section className="w-full py-4 md:py-6">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Welcome to CloudStage</h1>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">Discover virtual concerts from around the globe.</p>
                </div>
            </div>
        </section>
        
        <section className="w-full pb-6 md:pb-8">
            <div className="container px-4 md:px-6">
                 <HeroCarousel />
            </div>
        </section>

        <section id="events" className="w-full py-6 md:py-8 bg-secondary/20">
          <div className="container px-4 md:px-6">
             <div className="mx-auto w-full max-w-4xl space-y-4 mb-12">
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
