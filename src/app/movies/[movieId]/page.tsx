
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MovieDetailClient from './MovieDetailClient';
import type { Movie } from '@/lib/types';
import { useMovies } from '@/hooks/useMovies';

export default function MovieDetailPage() {
  const { movies } = useMovies();
  const params = useParams();
  const movieId = params.movieId as string;
  
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movies.length > 0) {
      const foundMovie = movies.find(m => m.id === movieId);
      setMovie(foundMovie);
      setLoading(false);
    }
    // We keep this check simple. If movies aren't loaded yet, `loading` remains true.
    // When `movies` populates, this effect re-runs and finds the movie.
  }, [movies, movieId]);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading movie...</p>
        </div>
    );
  }

  return (
    <>
      <Header />
      <MovieDetailClient movie={movie} />
    </>
  );
}
