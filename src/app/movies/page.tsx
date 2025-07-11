'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EVENT_CATEGORIES } from '@/lib/events';
import { Search } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function MoviesPage() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Past');
  }, [events]);

  const filteredEvents = useMemo(() => {
    return approvedEvents.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedEvents, searchTerm, selectedCategory]);

  return (
    <>
      <Header />
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">All Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our full collection of live, upcoming, and past events. Use the filters to find exactly what you're looking for.
            </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {EVENT_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => <EventCard key={event.id} event={event} />)
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No events found.</p>
          )}
        </div>
      </main>
    </>
  );
}
