
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Artist, ArtistStatus, VerificationRequest, VerificationRequestStatus } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  where,
  getDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/hooks/useAuth';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ArtistContextType {
  artists: Artist[];
  verificationRequests: VerificationRequest[];
  setVerificationRequests: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
  addArtist: (artistData: Omit<Artist, 'id' | 'uid' | 'status' | 'isVerified' | 'followers'>) => Promise<void>;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => Promise<void>;
  updateArtist: (artistData: Artist) => Promise<void>;
  submitVerificationRequest: (artistId: string, requestData: any) => Promise<void>;
  approveVerification: (artistId: string) => Promise<void>;
  rejectVerification: (artistId: string, reason: string) => Promise<void>;
  followArtist: (artistId: string, userEmail: string) => Promise<void>;
  unfollowArtist: (artistId: string, userEmail: string) => Promise<void>;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "artist"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const artistsData: Artist[] = [];
      querySnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() } as Artist);
      });
      setArtists(artistsData);
    }, (error) => {
        console.error("Firestore Error (Artists):", error);
    });

    return () => unsubscribe();
  }, []);

  const addArtist = async (artistData: Omit<Artist, 'id' | 'uid' | 'status' | 'isVerified' | 'followers' | 'rejectionReason'>) => {
    if (!artistData.password) {
        throw new Error("Password is required to create an artist account.");
    }
    
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, artistData.email, artistData.password);
    const newArtistUser = userCredential.user;

    // 2. Upload profile picture to storage
    const profilePicRef = ref(storage, `profile-images/${newArtistUser.uid}/profile.jpg`);
    await uploadString(profilePicRef, artistData.profilePictureUrl, 'data_url');
    const downloadURL = await getDownloadURL(profilePicRef);

    // 3. Update auth user profile
    await updateProfile(newArtistUser, { 
        displayName: artistData.name,
        photoURL: downloadURL
    });

    // 4. Create artist document in Firestore 'users' collection
    const artistDocRef = doc(db, "users", newArtistUser.uid);
    
    const finalArtistData = {
        ...artistData,
        uid: newArtistUser.uid,
        profilePictureUrl: downloadURL,
        role: 'artist',
        status: 'Pending' as ArtistStatus,
        isVerified: false,
        followers: [],
        createdAt: serverTimestamp(),
    };
    delete (finalArtistData as any).password; // Don't store password in Firestore

    await setDoc(artistDocRef, finalArtistData);
  };
  
  const updateArtist = async (artistData: Artist) => {
      const artistRef = doc(db, "users", artistData.id);
      await updateDoc(artistRef, { ...artistData });
  };

  const updateArtistStatus = async (artistId: string, status: ArtistStatus, reason?: string) => {
    const artistRef = doc(db, "users", artistId);
    const updateData: { status: ArtistStatus; rejectionReason?: string } = { status };
    if (reason) {
        updateData.rejectionReason = reason;
    }
    await updateDoc(artistRef, updateData);
  };
  
  const submitVerificationRequest = async (artistId: string, requestData: any) => {
    const artistDoc = await getDoc(doc(db, "users", artistId));
    if (!artistDoc.exists()) throw new Error("Artist not found");
    const artist = artistDoc.data() as Artist;
    
    await addDoc(collection(db, "verificationRequests"), {
      artistId: artist.id,
      artistName: artist.name,
      artistEmail: artist.email,
      artistProfilePictureUrl: artist.profilePictureUrl,
      status: 'Pending',
      ...requestData,
      submittedAt: serverTimestamp(),
    });
  };

  const approveVerification = async (artistId: string) => {
    const artistRef = doc(db, "users", artistId);
    await updateDoc(artistRef, { isVerified: true });
    
    const requestQuery = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
    onSnapshot(requestQuery, (snapshot) => {
      snapshot.docs.forEach(async (doc) => {
        await updateDoc(doc.ref, { status: 'Approved' });
      });
    });
  };

  const rejectVerification = async (artistId: string, reason: string) => {
    const requestQuery = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
    onSnapshot(requestQuery, (snapshot) => {
      snapshot.docs.forEach(async (doc) => {
        await updateDoc(doc.ref, { status: 'Rejected', rejectionReason: reason });
      });
    });
  };

  const followArtist = async (artistId: string, userEmail: string) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist || artist.followers.includes(userEmail)) return;
    const updatedFollowers = [...artist.followers, userEmail];
    await updateDoc(doc(db, "users", artistId), { followers: updatedFollowers });
  };

  const unfollowArtist = async (artistId: string, userEmail: string) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;
    const updatedFollowers = artist.followers.filter(email => email !== userEmail);
    await updateDoc(doc(db, "users", artistId), { followers: updatedFollowers });
  };


  return (
    <ArtistContext.Provider value={{ 
        artists, 
        verificationRequests, 
        setVerificationRequests,
        addArtist,
        updateArtist, 
        updateArtistStatus,
        submitVerificationRequest,
        approveVerification,
        rejectVerification,
        followArtist,
        unfollowArtist
    }}>
      {children}
    </ArtistContext.Provider>
  );
}
