
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus, VerificationRequest, VerificationRequestStatus } from '@/lib/types';
import { dummyArtists, dummyVerificationRequests } from '@/lib/artists';

const LOCALSTORAGE_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB

// A custom hook to manage state in localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
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

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const stringifiedValue = JSON.stringify(valueToStore);
      
      // Safeguard against exceeding quota
      if (stringifiedValue.length > LOCALSTORAGE_SIZE_LIMIT) {
           console.error(
              `Error setting localStorage key “${key}”: Data size (${stringifiedValue.length}) exceeds limit. A large object (like a file) was likely passed unintentionally.`
           );
           return; // Abort saving to prevent crash
      }

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, stringifiedValue);
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
  submitVerificationRequest: (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl' | 'rejectionReason'>) => void;
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
    setArtists(prevArtists => [newArtist, ...prevArtists]);
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

  const submitVerificationRequest = (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl' | 'rejectionReason'>) => {
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
      setVerificationRequests(prevRequests => [newRequest, ...prevRequests]);
  };
  
  const approveVerification = (artistId: string) => {
    // Update artist's verification status
    setArtists(artists.map(artist => 
        artist.id === artistId ? { ...artist, isVerified: true } : artist
    ));

    // Update the request's status
    setVerificationRequests((requests: VerificationRequest[]) => requests.map((req: VerificationRequest) => 
        req.artistId === artistId ? { ...req, status: 'Approved' } : req
    ));
  };

  const rejectVerification = (artistId: string, reason: string) => {
     setVerificationRequests((requests: VerificationRequest[]) => requests.map((req: VerificationRequest) => 
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
