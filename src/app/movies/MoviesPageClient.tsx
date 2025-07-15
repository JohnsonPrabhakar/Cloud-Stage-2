
'use client';

import { useState, useMemo } from 'react';
import { useMovies } from '@/hooks/useMovies';
import { MOVIE_GENRES, MOVIE_LANGUAGES } from '@/lib/movies';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Play, Film, Languages, ListFilter, Star, CalendarDays, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Movie } from '@/lib/types';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Card className="w-full flex flex-col h-full overflow-hidden transition-all hover:shadow-lg group">
      <Link href={`/movies/${movie.id}`} className="block flex flex-col h-full">
        <CardContent className="p-0 relative">
          <Image
            src={movie.bannerUrl || 'https://placehold.co/600x900.png'}
            alt={movie.title}
            width={600}
            height={400}
            className="w-full h-auto aspect-[2/3] object-cover"
            data-ai-hint="movie poster"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
              <h3 className="text-lg font-headline text-white drop-shadow-md">{movie.title}</h3>
              <div className="flex items-center text-xs text-white/80 gap-2 mt-1">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm border-none text-white">{movie.genre}</Badge>
                <span>{movie.durationMinutes} min</span>
              </div>
          </div>
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                  <Play className="mr-2"/> Watch Now
              </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

const sortOptions = [
    { label: "Popularity", value: "popularity", icon: Star },
    { label: "Release Date", value: "release-date", icon: CalendarDays },
    { label: "A-Z", value: "a-z", icon: ListFilter },
];


export default function MoviesPageClient() {
  const { movies } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');

  const filteredMovies = useMemo(() => {
    let sortedMovies = [...movies];

    if (sortBy === 'a-z') {
        sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
    }
    // Add other sort logic as needed, e.g., by release date or popularity if data exists

    return sortedMovies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(movie.language);
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(movie.genre);
      return matchesSearch && matchesLanguage && matchesGenre;
    });
  }, [movies, searchTerm, selectedLanguages, selectedGenres, sortBy]);

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

  const hasActiveFilters = searchTerm || selectedLanguages.length > 0 || selectedGenres.length > 0;

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">Movies</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of movies. Use the filters to find your next favorite film.
            </p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
             <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by movie title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Film className="mr-2" />
                      <span>{selectedGenres.length > 0 ? `${selectedGenres.length} Genre(s)` : 'All Genres'}</span>
                      <ChevronDown className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {MOVIE_GENRES.map(genre => (
                      <DropdownMenuCheckboxItem
                        key={genre}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => toggleFilter(selectedGenres, setSelectedGenres, genre)}
                      >
                        {genre}
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
                    {MOVIE_LANGUAGES.map(lang => (
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
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                            <ListFilter className="mr-2"/> Sort by: {sortOptions.find(o => o.value === sortBy)?.label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         {sortOptions.map(opt => (
                            <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)}>
                                <opt.icon className="mr-2"/> {opt.label}
                            </DropdownMenuItem>
                         ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {hasActiveFilters && (
                <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSelectedGenres([]); setSelectedLanguages([]); }}>
                        <X className="mr-2 h-4 w-4"/> Clear All Filters
                    </Button>
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.length > 0 ? (
            filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-16">
                <h2 className="text-2xl font-semibold">No Movies Found</h2>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </main>
  );
}
