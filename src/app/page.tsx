'use client';

import { useState, useMemo } from 'react';
import type { Event } from '@/lib/types';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EVENT_CATEGORIES } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/layout/Header';

export default function Home() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const languages = useMemo(() => {
    const allLanguages = events.map(event => event.language);
    return ['All', ...Array.from(new Set(allLanguages))];
  }, [events]);

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Past' || e.status === 'Approved');
  }, [events]);

  const filteredEvents = useMemo(() => {
    return approvedEvents.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'All' || event.language === selectedLanguage;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && matchesLanguage;
    });
  }, [approvedEvents, searchTerm, selectedCategory, selectedLanguage]);

  const now = new Date();
  const liveEvents = filteredEvents.filter(e => new Date(e.date) <= now && (e.status === 'Live' || e.status === 'Approved'));
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) > now && (e.status === 'Upcoming' || e.status === 'Approved'));
  const pastEvents = filteredEvents.filter(e => new Date(e.date) <= now && e.status === 'Past');

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    The Stage is Yours
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Watch live music, support artists, enjoy comedy, yoga, talk shows and more — all in one stage.
                  </p>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="concert event"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="events" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Explore Events</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find your next favorite show. Search by title or filter by category.
                </p>
              </div>
            </div>
            
            <div className="mx-auto max-w-5xl">
                <div className="my-8 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by event title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10"
                        />
                    </div>
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {EVENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Filter by language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang} value={lang}>{lang === 'All' ? 'All Languages' : lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs defaultValue="live" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="live">Live</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    <TabsContent value="live">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {liveEvents.length > 0 ? liveEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            )) : <p className="col-span-full text-center text-muted-foreground">No live events match your criteria.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="upcoming">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            )) : <p className="col-span-full text-center text-muted-foreground">No upcoming events match your criteria.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="past">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {pastEvents.length > 0 ? pastEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            )) : <p className="col-span-full text-center text-muted-foreground">No past events match your criteria.</p>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
