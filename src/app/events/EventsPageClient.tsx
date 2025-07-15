
'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import type { Event } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, X, Languages, ListFilter, ChevronDown } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_LANGUAGES } from '@/lib/events';


function EventGridSection({ title, events }: { title: string; events: Event[] }) {
    if (events.length === 0) {
        return null; // Don't render the section if there are no events
    }

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
            <Separator className="last:hidden"/>
        </section>
    );
}

export default function EventsPageClient() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(event.language);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
      return matchesSearch && matchesLanguage && matchesCategory;
    });
  }, [events, searchTerm, selectedLanguages, selectedCategories]);

  const liveEvents = useMemo(() => filteredEvents.filter(e => e.status === 'Live'), [filteredEvents]);
  const upcomingEvents = useMemo(() => filteredEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved'), [filteredEvents]);
  const pastEvents = useMemo(() => filteredEvents.filter(e => e.status === 'Past'), [filteredEvents]);

  const toggleFilter = (filterState: string[], setFilterState: (value: string[]) => void, value: string) => {
    const currentIndex = filterState.indexOf(value);
    const newFilterState = [...filterState];
    if (currentIndex === -1) {
      newFilterState.push(value);
    } else {
      newFilterState.splice(currentIndex, 1);
    }
    setFilterState(newFilterState);
  };

  const hasActiveFilters = searchTerm || selectedLanguages.length > 0 || selectedCategories.length > 0;
  const allEventsCount = liveEvents.length + upcomingEvents.length + pastEvents.length;

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">All Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover what's happening on CloudStage. Your next favorite live experience awaits.
            </p>
        </div>
        
        <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by event or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                            <ListFilter className="mr-2" />
                            <span>{selectedCategories.length > 0 ? `${selectedCategories.length} Genre(s)` : 'All Genres'}</span>
                            <ChevronDown className="ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {EVENT_CATEGORIES.map(category => (
                            <DropdownMenuCheckboxItem
                                key={category}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                            >
                                {category}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                            <Languages className="mr-2" />
                            <span>{selectedLanguages.length > 0 ? `${selectedLanguages.length} Language(s)` : 'All Languages'}</span>
                            <ChevronDown className="ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Filter by Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {EVENT_LANGUAGES.map(lang => (
                            <DropdownMenuCheckboxItem
                                key={lang}
                                checked={selectedLanguages.includes(lang)}
                                onCheckedChange={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                            >
                                {lang}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {hasActiveFilters && (
                <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSelectedCategories([]); setSelectedLanguages([]); }}>
                        <X className="mr-2 h-4 w-4"/> Clear All Filters
                    </Button>
                </div>
            )}
        </div>


        <div className="space-y-12">
            {allEventsCount > 0 ? (
                <>
                    <EventGridSection title="Live Now" events={liveEvents} />
                    <EventGridSection title="Upcoming" events={upcomingEvents} />
                    <EventGridSection title="Past Events" events={pastEvents} />
                </>
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
