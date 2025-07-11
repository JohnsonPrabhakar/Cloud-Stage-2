
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus, VerificationRequest, VerificationRequestStatus } from '@/lib/types';
import { dummyArtists, dummyVerificationRequests } from '@/lib/artists';

// A custom hook to manage state in localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        // This is where the quota error was happening.
        // It's fixed now because we no longer pass the large file object here.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}


interface ArtistContextType {
  artists: Artist[];
  addArtist: (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers'>) => void;
  updateArtist: (updatedArtist: Artist) => void;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => void;
  followArtist: (artistId: string, userEmail: string) => void;
  unfollowArtist: (artistId: string, userEmail: string) => void;
  
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl'>) => void;
  approveVerification: (artistId: string) => void;
  rejectVerification: (artistId: string, reason: string) => void;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useLocalStorage<Artist[]>('artists', dummyArtists);
  const [verificationRequests, setVerificationRequests] = useLocalStorage<VerificationRequest[]>('verificationRequests', dummyVerificationRequests);

  const addArtist = (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers'>) => {
    const newArtist: Artist = {
      ...artistData,
      id: `artist-${new Date().getTime()}`,
      status: 'Pending',
      isVerified: false,
      followers: [],
    };
    setArtists([newArtist, ...artists]);
  };

  const updateArtist = (updatedArtistData: Artist) => {
      setArtists(artists.map(artist => artist.id === updatedArtistData.id ? updatedArtistData : artist));
  }

  const updateArtistStatus = (artistId: string, status: ArtistStatus, reason?: string) => {
    setArtists(artists.map(artist =>
      artist.id === artistId
        ? { ...artist, status, rejectionReason: status === 'Rejected' ? reason : undefined }
        : artist
    ));
  };

  const followArtist = (artistId: string, userEmail: string) => {
    setArtists(artists.map(artist => 
      artist.id === artistId ? { ...artist, followers: [...artist.followers, userEmail] } : artist
    ));
  };

  const unfollowArtist = (artistId: string, userEmail: string) => {
    setArtists(artists.map(artist =>
      artist.id === artistId ? { ...artist, followers: artist.followers.filter(email => email !== userEmail) } : artist
    ));
  };


  // --- Verification Logic ---

  const submitVerificationRequest = (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl'>) => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;

      const newRequest: VerificationRequest = {
        id: `vr-${new Date().getTime()}`,
        artistId: artist.id,
        artistName: artist.name,
        artistEmail: artist.email,
        artistProfilePictureUrl: artist.profilePictureUrl,
        status: 'Pending',
        ...requestData,
      };
      setVerificationRequests([newRequest, ...verificationRequests]);
  };
  
  const approveVerification = (artistId: string) => {
    // Update artist's verification status
    setArtists(artists.map(artist => 
        artist.id === artistId ? { ...artist, isVerified: true } : artist
    ));

    // Update the request's status
    setVerificationRequests(requests => requests.map(req => 
        req.artistId === artistId ? { ...req, status: 'Approved' } : req
    ));
  };

  const rejectVerification = (artistId: string, reason: string) => {
     setVerificationRequests(requests => requests.map(req => 
        req.artistId === artistId ? { ...req, status: 'Rejected', rejectionReason: reason } : req
    ));
  };


  return (
    <ArtistContext.Provider value={{ 
        artists, addArtist, updateArtist, updateArtistStatus, followArtist, unfollowArtist,
        verificationRequests, submitVerificationRequest, approveVerification, rejectVerification
    }}>
      {children}
    </ArtistContext.Provider>
  );
}
