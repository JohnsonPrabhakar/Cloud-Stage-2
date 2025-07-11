'use client';

import { useState, useMemo } from 'react';
import { useMovies } from '@/hooks/useMovies';
import { MOVIE_GENRES, MOVIE_LANGUAGES } from '@/lib/movies';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Movie } from '@/lib/types';

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Card className="w-full flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <Image
          src={movie.bannerUrl || 'https://placehold.co/600x400.png'}
          alt={movie.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint="movie banner"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-lg font-headline hover:text-primary transition-colors">{movie.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-grow">{movie.description}</p>
        <div className="flex items-center text-sm text-muted-foreground mt-4 gap-2 flex-wrap">
          <Badge variant="secondary">{movie.genre}</Badge>
          <Badge variant="outline">{movie.language}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}


export default function MoviesPageClient() {
  const { movies } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(movie.language);
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(movie.genre);
      return matchesSearch && matchesLanguage && matchesGenre;
    });
  }, [movies, searchTerm, selectedLanguages, selectedGenres]);

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguages([]);
    setSelectedGenres([]);
  }

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
            {/* Search */}
            <div className="relative w-full max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by movie title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4">
               <div>
                  <h3 className="font-semibold mb-2 text-center">Genre</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {MOVIE_GENRES.map(genre => (
                      <Button key={genre} variant={selectedGenres.includes(genre) ? 'default' : 'outline'} onClick={() => toggleFilter(selectedGenres, setSelectedGenres, genre)}>
                        {genre}
                      </Button>
                    ))}
                  </div>
              </div>
               <div>
                  <h3 className="font-semibold mb-2 text-center">Language</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {MOVIE_LANGUAGES.map(lang => (
                      <Button key={lang} variant={selectedLanguages.includes(lang) ? 'default' : 'outline'} onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}>
                        {lang}
                      </Button>
                    ))}
                  </div>
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
