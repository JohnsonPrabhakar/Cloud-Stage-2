'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus } from '@/lib/types';
import { dummyArtists } from '@/lib/artists';

interface ArtistContextType {
  artists: Artist[];
  addArtist: (artist: Omit<Artist, 'id' | 'status' | 'rejectionReason'>) => void;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => void;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const storedArtists = localStorage.getItem('artists');
    if (storedArtists) {
        try {
            const parsedArtists = JSON.parse(storedArtists);
            if(Array.isArray(parsedArtists) && parsedArtists.length > 0){
                setArtists(parsedArtists);
            } else {
                 setArtists(dummyArtists);
                 localStorage.setItem('artists', JSON.stringify(dummyArtists));
            }
        } catch (error) {
            console.error("Failed to parse artists from localStorage, using dummy data.", error);
            setArtists(dummyArtists);
            localStorage.setItem('artists', JSON.stringify(dummyArtists));
        }
    } else {
        setArtists(dummyArtists);
        localStorage.setItem('artists', JSON.stringify(dummyArtists));
    }
  }, []);

  const updateArtistsInStorage = (updatedArtists: Artist[]) => {
    setArtists(updatedArtists);
    localStorage.setItem('artists', JSON.stringify(updatedArtists));
  };
  
  const addArtist = (newArtistData: Omit<Artist, 'id' | 'status' | 'rejectionReason'>) => {
    const newArtist: Artist = {
        ...newArtistData,
        id: new Date().getTime().toString(),
        status: 'Pending',
    };
    const updatedArtists = [newArtist, ...artists];
    updateArtistsInStorage(updatedArtists);
  };

  const updateArtistStatus = (artistId: string, status: ArtistStatus, reason?: string) => {
    const updatedArtists = artists.map(artist => {
        if (artist.id === artistId) {
            return { ...artist, status, rejectionReason: reason };
        }
        return artist;
    });
    updateArtistsInStorage(updatedArtists);
  };


  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtistStatus }}>
      {children}
    </ArtistContext.Provider>
  );
}
