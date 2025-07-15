
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Movie } from '@/lib/types';
import { dummyMovies } from '@/lib/movies';

interface MovieContextType {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const storedMovies = localStorage.getItem('movies');
    if (storedMovies) {
        try {
            const parsedMovies = JSON.parse(storedMovies);
            setMovies(parsedMovies);
        } catch (error) {
            console.error("Failed to parse movies from localStorage, initializing with empty array.", error);
            setMovies([]);
        }
    } else {
        // Start with an empty array if no movies are in storage
        setMovies([]);
    }
  }, []);

  const updateMoviesInStorage = (updatedMovies: Movie[]) => {
    setMovies(updatedMovies);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
  };

  const addMovie = (movie: Movie) => {
    const newMovieWithDuration = { ...movie, durationMinutes: movie.durationMinutes || 120 };
    const updatedMovies = [newMovieWithDuration, ...movies];
    updateMoviesInStorage(updatedMovies);
  };

  return (
    <MovieContext.Provider value={{ movies, addMovie }}>
      {children}
    </MovieContext.Provider>
  );
}
