
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Movie } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface MovieContextType {
  movies: Movie[];
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moviesData: Movie[] = [];
      querySnapshot.forEach((doc) => {
        moviesData.push({ id: doc.id, ...doc.data() } as Movie);
      });
      setMovies(moviesData);
    });
    return () => unsubscribe();
  }, []);

  const addMovie = async (movie: Omit<Movie, 'id'>) => {
    const newMovieWithDuration = { ...movie, durationMinutes: movie.durationMinutes || 120 };
    await addDoc(collection(db, "movies"), {
      ...newMovieWithDuration,
      createdAt: serverTimestamp()
    });
  };

  return (
    <MovieContext.Provider value={{ movies, addMovie }}>
      {children}
    </MovieContext.Provider>
  );
}
