
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
    // We need to handle the case where movies are not yet loaded from localStorage
    if (movies.length > 0 && movieId) {
      const foundMovie = movies.find(m => m.id === movieId);
      setMovie(foundMovie);
      setLoading(false);
    } else if (movies.length > 0 && !loading) {
      // If movies are loaded, but movie not found
      setLoading(false);
    } else if (movies.length === 0 && !loading) {
        // If movies are loaded and empty, and we are not loading, the movie isn't found
        setLoading(false);
    }
    // Added dependency on `loading` to handle initial state correctly.
  }, [movies, movieId, loading]);


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
