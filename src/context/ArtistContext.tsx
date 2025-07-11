
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus, VerificationRequest, VerificationRequestStatus } from '@/lib/types';
import { dummyArtists, dummyVerificationRequests } from '@/lib/artists';

interface ArtistContextType {
  artists: Artist[];
  addArtist: (artist: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers' | 'rejectionReason'>) => void;
  updateArtist: (artist: Artist) => void;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => void;
  followArtist: (artistId: string, userEmail: string) => void;
  unfollowArtist: (artistId: string, userEmail: string) => void;
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (artistId: string, data: Omit<VerificationRequest, 'id' | 'artistId' | 'status' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl' | 'agreedToTerms' >) => void;
  approveVerification: (artistId: string) => void;
  rejectVerification: (artistId: string, reason: string) => void;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Basic check to see if it's not empty, could be more robust
                if ((Array.isArray(parsed) && parsed.length > 0) || (!Array.isArray(parsed) && parsed)) {
                    return parsed;
                }
            }
            window.localStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};


export function ArtistProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useLocalStorage<Artist[]>('artists', dummyArtists);
  const [verificationRequests, setVerificationRequests] = useLocalStorage<VerificationRequest[]>('verificationRequests', dummyVerificationRequests);

  const addArtist = (newArtistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers' | 'rejectionReason'>) => {
    const newArtist: Artist = {
        ...newArtistData,
        id: new Date().getTime().toString(),
        status: 'Pending',
        isVerified: false,
        followers: [],
    };
    setArtists([newArtist, ...artists]);
  };

  const updateArtist = (updatedArtistData: Artist) => {
      const updatedArtists = artists.map(artist => 
          artist.id === updatedArtistData.id ? updatedArtistData : artist
      );
      setArtists(updatedArtists);
  }

  const updateArtistStatus = (artistId: string, status: ArtistStatus, reason?: string) => {
    const updatedArtists = artists.map(artist => {
        if (artist.id === artistId) {
            return { ...artist, status, rejectionReason: reason };
        }
        return artist;
    });
    setArtists(updatedArtists);
  };
  
  const followArtist = (artistId: string, userEmail: string) => {
      const updatedArtists = artists.map(artist => {
          if (artist.id === artistId && !artist.followers.includes(userEmail)) {
              return { ...artist, followers: [...artist.followers, userEmail] };
          }
          return artist;
      });
      setArtists(updatedArtists);
  };

  const unfollowArtist = (artistId: string, userEmail: string) => {
      const updatedArtists = artists.map(artist => {
          if (artist.id === artistId) {
              return { ...artist, followers: artist.followers.filter(email => email !== userEmail) };
          }
          return artist;
      });
      setArtists(updatedArtists);
  };

  const submitVerificationRequest = (artistId: string, data: Omit<VerificationRequest, 'id' | 'artistId' | 'status' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl'>) => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;

      const newRequest: VerificationRequest = {
          ...data,
          id: new Date().getTime().toString(),
          artistId: artist.id,
          artistName: artist.name,
          artistEmail: artist.email,
          artistProfilePictureUrl: artist.profilePictureUrl,
          status: 'Pending',
      }
      setVerificationRequests([newRequest, ...verificationRequests]);
  };

  const approveVerification = (artistId: string) => {
      setArtists(artists.map(a => a.id === artistId ? { ...a, isVerified: true } : a));
      setVerificationRequests(verificationRequests.map(r => r.artistId === artistId ? { ...r, status: 'Approved' } : r));
  };

  const rejectVerification = (artistId: string, reason: string) => {
      setArtists(artists.map(a => a.id === artistId ? { ...a, isVerified: false } : a));
      setVerificationRequests(verificationRequests.map(r => r.artistId === artistId ? { ...r, status: 'Rejected', rejectionReason: reason } : r));
  };


  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtist, updateArtistStatus, followArtist, unfollowArtist, verificationRequests, submitVerificationRequest, approveVerification, rejectVerification }}>
      {children}
    </ArtistContext.Provider>
  );
}
