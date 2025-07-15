
'use client';

import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import type { Artist, ArtistStatus, VerificationRequest } from '@/lib/types';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/hooks/useAuth';

interface ArtistContextType {
  artists: Artist[];
  addArtist: (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers' | 'uid'>) => Promise<void>;
  updateArtist: (updatedArtist: Artist) => Promise<void>;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => Promise<void>;
  followArtist: (artistId: string, userEmail: string) => void;
  unfollowArtist: (artistId: string, userEmail: string) => void;
  
  verificationRequests: VerificationRequest[];
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
    });

    let unsubscribeVerification: () => void = () => {};

    // Only fetch verification requests if the user is an admin
    if (user?.role === 'admin') {
      const vq = query(collection(db, "verificationRequests"));
      unsubscribeVerification = onSnapshot(vq, (querySnapshot) => {
        const requestsData: VerificationRequest[] = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() } as VerificationRequest);
        });
        setVerificationRequests(requestsData);
      });
    } else {
      setVerificationRequests([]); // Clear requests for non-admins
    }

    return () => {
      unsubscribeArtists();
      unsubscribeVerification();
    };
  }, [user]); // Rerun effect when user changes

  const addArtist = async (artistData: Omit<Artist, 'id' | 'status' | 'isVerified' | 'followers'| 'uid'>) => {
    if (!artistData.password) throw new Error("Password is required for artist registration.");
    
    // This is tricky because we need a separate auth instance to not log out the current user
    // For simplicity, we assume this is a public action. In a real app, this might be an admin function or use a different flow.
    // This flow is simplified and not secure for production.
    try {
      // NOTE: This auth flow for registration is simplified. A real-world scenario
      // would use a backend function to create users to avoid needing a separate auth instance.
      // const tempAuth = getAuth(app); // Can't re-initialize
      // const userCredential = await createUserWithEmailAndPassword(tempAuth, artistData.email, artistData.password);
      // const firebaseUser = userCredential.user;

      // For this project, we'll add to firestore and assume auth user is created separately or by an admin.
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
        verificationRequests, submitVerificationRequest, approveVerification, rejectVerification
    }}>
      {children}
    </ArtistContext.Provider>
  );
}

// Hook to use the context
export const useArtists = () => {
    const context = useContext(ArtistContext);
    if (context === undefined) {
        throw new Error('useArtists must be used within a ArtistProvider');
    }
    return context;
};
