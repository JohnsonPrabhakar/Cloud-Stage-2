'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus, VerificationRequest, VerificationStatus } from '@/lib/types';
import { dummyArtists } from '@/lib/artists';

interface ArtistContextType {
  artists: Artist[];
  addArtist: (artist: Omit<Artist, 'id' | 'status' | 'rejectionReason'>) => void;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => void;
  submitVerificationRequest: (artistId: string, request: Omit<VerificationRequest, 'status' | 'rejectionReason'>) => void;
  updateVerificationStatus: (artistId: string, status: VerificationStatus, reason?: string) => void;
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
        isVerified: false
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

  const submitVerificationRequest = (artistId: string, request: Omit<VerificationRequest, 'status' | 'rejectionReason'>) => {
    const updatedArtists = artists.map(artist => {
      if (artist.id === artistId) {
        return { ...artist, verificationRequest: { ...request, status: 'Pending' as const } };
      }
      return artist;
    });
    updateArtistsInStorage(updatedArtists);
  };

  const updateVerificationStatus = (artistId: string, status: VerificationStatus, reason?: string) => {
      const updatedArtists = artists.map(artist => {
      if (artist.id === artistId) {
        const newVerificationRequest = artist.verificationRequest ? { ...artist.verificationRequest, status, rejectionReason: reason } : undefined;
        return {
          ...artist,
          isVerified: status === 'Approved',
          verificationRequest: newVerificationRequest,
        };
      }
      return artist;
    });
    updateArtistsInStorage(updatedArtists);
  }


  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtistStatus, submitVerificationRequest, updateVerificationStatus }}>
      {children}
    </ArtistContext.Provider>
  );
}
