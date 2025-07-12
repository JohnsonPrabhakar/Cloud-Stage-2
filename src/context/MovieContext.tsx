'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Movie } from '@/lib/types';

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
            console.error("Failed to parse movies from localStorage, initializing as empty.", error);
            setMovies([]);
        }
    } else {
        // Initialize with an empty array if nothing is in storage
        setMovies([]);
    }
  }, []);

  const updateMoviesInStorage = (updatedMovies: Movie[]) => {
    setMovies(updatedMovies);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
  };

  const addMovie = (movie: Movie) => {
    const updatedMovies = [movie, ...movies];
    updateMoviesInStorage(updatedMovies);
  };

  return (
    <MovieContext.Provider value={{ movies, addMovie }}>
      {children}
    </MovieContext.Provider>
  );
}
