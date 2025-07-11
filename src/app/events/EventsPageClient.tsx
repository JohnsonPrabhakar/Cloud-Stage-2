
'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EVENT_CATEGORIES } from '@/lib/events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import type { EventCategory } from '@/lib/types';

export default function EventsPageClient() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [showFree, setShowFree] = useState(false);

  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Approved');
  }, [events]);

  const filteredEvents = useMemo(() => {
    return approvedEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
      const matchesPrice = !showFree || event.ticketPrice === 0;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [approvedEvents, searchTerm, selectedCategories, showFree]);

  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setShowFree(false);
  }

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || showFree;

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">All Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover what's happening on CloudStage. Your next favorite live experience awaits.
            </p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
            <div className="relative w-full max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by event or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            <div className="flex flex-col gap-4 items-center">
               <div>
                  <h3 className="font-semibold mb-2 text-center">Categories</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EVENT_CATEGORIES.map(category => (
                      <Button key={category} variant={selectedCategories.includes(category) ? 'default' : 'outline'} onClick={() => toggleCategory(category)}>
                        {category}
                      </Button>
                    ))}
                  </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant={showFree ? 'default' : 'outline'} onClick={() => setShowFree(!showFree)}>
                    Free Events
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
                <div className="text-center">
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4"/> Clear Filters
                    </Button>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-16">
                <h2 className="text-2xl font-semibold">No Events Found</h2>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </main>
  );
}
