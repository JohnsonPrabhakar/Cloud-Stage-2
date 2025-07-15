
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, ArtistStatus, VerificationRequest } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface ArtistContextType {
  artists: Artist[];
  addArtist: (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers' | 'uid' | 'password'>) => Promise<void>;
  updateArtist: (updatedArtist: Artist) => Promise<void>;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => Promise<void>;
  followArtist: (artistId: string, userEmail: string) => void;
  unfollowArtist: (artistId: string, userEmail: string) => void;
  
  verificationRequests: VerificationRequest[];
  setVerificationRequests: (requests: VerificationRequest[]) => void;
  submitVerificationRequest: (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl' | 'rejectionReason'>) => Promise<void>;
  approveVerification: (artistId: string) => void;
  rejectVerification: (artistId: string, reason: string) => void;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "artist"));
    const unsubscribeArtists = onSnapshot(q, (querySnapshot) => {
      const artistsData: Artist[] = [];
      querySnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() } as Artist);
      });
      setArtists(artistsData);
    }, (error) => {
        console.error("Error fetching artists:", error);
    });
    
    return () => {
      unsubscribeArtists();
    };
  }, []);

  const addArtist = async (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers'| 'uid' | 'password'>) => {
    try {
      const profilePicRef = ref(storage, `profile-images/temp/${Date.now()}.jpg`);
      await uploadString(profilePicRef, artistData.profilePictureUrl, 'data_url');
      const profilePictureUrl = await getDownloadURL(profilePicRef);

      const docRef = await addDoc(collection(db, "users"), {
        ...artistData,
        role: 'artist',
        status: 'Pending',
        isVerified: false,
        followers: [],
        createdAt: serverTimestamp(),
        profilePictureUrl, // using the storage URL
      });
      
      console.log("Artist registered with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding artist: ", e);
      throw e;
    }
  };

  const updateArtist = async (updatedArtistData: Artist) => {
      const artistRef = doc(db, "users", updatedArtistData.id);
      await updateDoc(artistRef, updatedArtistData as any);
  }

  const updateArtistStatus = async (artistId: string, status: ArtistStatus, reason?: string) => {
    const artistRef = doc(db, "users", artistId);
    await updateDoc(artistRef, {
      status,
      rejectionReason: status === 'Rejected' ? reason : ""
    });
  };

  const followArtist = async (artistId: string, userEmail: string) => {
     // Not implemented with firestore for this scope, would require arrayUnion/arrayRemove
  };

  const unfollowArtist = async (artistId: string, userEmail: string) => {
    // Not implemented with firestore for this scope, would require arrayUnion/arrayRemove
  };

  const submitVerificationRequest = async (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistId' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl' | 'rejectionReason'>) => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;

      let performanceVideoUrl = '';
      if (requestData.performanceVideoUrl) {
         const videoRef = ref(storage, `verification-videos/${artist.id}/${Date.now()}`);
         await uploadString(videoRef, requestData.performanceVideoUrl, 'data_url');
         performanceVideoUrl = await getDownloadURL(videoRef);
      }

      await addDoc(collection(db, "verificationRequests"), {
        artistId: artist.id,
        artistName: artist.name,
        artistEmail: artist.email,
        artistProfilePictureUrl: artist.profilePictureUrl,
        status: 'Pending',
        workUrl1: requestData.workUrl1,
        workUrl2: requestData.workUrl2,
        reason: requestData.reason,
        performanceVideoUrl,
        submittedAt: serverTimestamp(),
      });
  };
  
  const approveVerification = async (artistId: string) => {
    const artistRef = doc(db, "users", artistId);
    await updateDoc(artistRef, { isVerified: true });
    
    const q = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
        const reqRef = doc(db, "verificationRequests", document.id);
        await updateDoc(reqRef, { status: 'Approved' });
    });
  };

  const rejectVerification = async (artistId: string, reason: string) => {
     const q = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
     const querySnapshot = await getDocs(q);
     querySnapshot.forEach(async (document) => {
        const reqRef = doc(db, "verificationRequests", document.id);
        await updateDoc(reqRef, { status: 'Rejected', rejectionReason: reason });
    });
  };


  return (
    <ArtistContext.Provider value={{ 
        artists, addArtist, updateArtist, updateArtistStatus, followArtist, unfollowArtist,
        verificationRequests, setVerificationRequests, submitVerificationRequest, approveVerification, rejectVerification
    }}>
      {children}
    </ArtistContext.Provider>
  );
}
