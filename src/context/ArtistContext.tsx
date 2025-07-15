
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Artist, VerificationRequest, ArtistStatus } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/hooks/useAuth';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface ArtistContextType {
  artists: Artist[];
  verificationRequests: VerificationRequest[];
  setVerificationRequests: (requests: VerificationRequest[]) => void;
  addArtist: (artistData: Omit<Artist, 'id' | 'uid' | 'status' | 'isVerified' | 'followers'>) => Promise<void>;
  updateArtist: (artistData: Artist) => Promise<void>;
  updateArtistStatus: (artistId: string, status: ArtistStatus, reason?: string) => Promise<void>;
  submitVerificationRequest: (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl'>) => Promise<void>;
  approveVerification: (artistId: string) => Promise<void>;
  rejectVerification: (artistId: string, reason: string) => Promise<void>;
  followArtist: (artistId: string, userEmail: string) => Promise<void>;
  unfollowArtist: (artistId: string, userEmail: string) => Promise<void>;
}

export const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const artistsQuery = query(collection(db, "users"), where("role", "==", "artist"));
    const unsubscribeArtists = onSnapshot(artistsQuery, (snapshot) => {
      const artistsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
      setArtists(artistsData);
    }, (error) => {
      console.error("Firestore Error (Artists):", error);
    });

    // This listener is primarily for admin use, but we'll manage it here
    const requestsQuery = query(collection(db, "verificationRequests"));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest));
        setVerificationRequests(requestsData);
    }, (error) => {
        // This can error for non-admins, which is expected. We can log it silently.
        // console.log("Note: User does not have permissions for verification requests. This is normal for non-admins.");
    });


    return () => {
        unsubscribeArtists();
        unsubscribeRequests();
    }
  }, []);

  const addArtist = async (artistData: Omit<Artist, 'id' | 'uid' | 'status' | 'isVerified' | 'followers'>) => {
    if (!artistData.password) throw new Error("Password is required to create an artist account.");
    
    // Note: In a real app, you might want a backend function to do this to avoid exposing password creation logic on the client.
    const userCredential = await createUserWithEmailAndPassword(auth, artistData.email, artistData.password);
    const user = userCredential.user;

    const storageRef = ref(storage, `profile-images/${user.uid}/profile.jpg`);
    // Assuming profilePictureUrl is a data URL from the form
    await uploadString(storageRef, artistData.profilePictureUrl, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);

    await updateProfile(user, { displayName: artistData.name, photoURL: downloadURL });
    
    const finalArtistData = {
        uid: user.uid,
        name: artistData.name,
        email: artistData.email,
        phone: artistData.phone,
        address: artistData.address,
        location: artistData.location,
        artistType: artistData.artistType,
        category: artistData.category,
        profilePictureUrl: downloadURL,
        bio: artistData.bio,
        socials: artistData.socials,
        role: 'artist',
        status: 'Pending', // All new artists must be approved
        isVerified: false,
        followers: [],
        createdAt: serverTimestamp(),
    };

    // Use the UID as the document ID for easy lookup
    await setDoc(doc(db, "users", user.uid), finalArtistData);
  };
  
  const updateArtist = async (artistData: Artist) => {
    const artistRef = doc(db, "users", artistData.id);
    await updateDoc(artistRef, { ...artistData });
  };
  
  const updateArtistStatus = async (artistId: string, status: ArtistStatus, reason?: string) => {
    const artistRef = doc(db, "users", artistId);
    await updateDoc(artistRef, { status, rejectionReason: reason || "" });
  };

  const submitVerificationRequest = async (artistId: string, requestData: Omit<VerificationRequest, 'id' | 'status' | 'artistName' | 'artistEmail' | 'artistProfilePictureUrl'>) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;
    
    // Check for existing pending request to avoid duplicates
    const existingRequestQuery = query(collection(db, "verificationRequests"), where("artistId", "==", artistId), where("status", "==", "Pending"));
    const existingRequestSnapshot = await getDocs(existingRequestQuery);
    if(!existingRequestSnapshot.empty) {
        toast({ title: "Request already submitted", description: "You already have a pending verification request.", variant: "destructive" });
        return;
    }

    await addDoc(collection(db, "verificationRequests"), {
        ...requestData,
        artistId,
        artistName: artist.name,
        artistEmail: artist.email,
        artistProfilePictureUrl: artist.profilePictureUrl,
        status: 'Pending',
        submittedAt: serverTimestamp()
    });
  };

  const approveVerification = async (artistId: string) => {
      const artistRef = doc(db, "users", artistId);
      await updateDoc(artistRef, { isVerified: true });

      // Update the status of the corresponding verification request
      const requestQuery = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
      const requestSnapshot = await getDocs(requestQuery);
      requestSnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { status: 'Approved' });
      });
  };

  const rejectVerification = async (artistId: string, reason: string) => {
      const requestQuery = query(collection(db, "verificationRequests"), where("artistId", "==", artistId));
      const requestSnapshot = await getDocs(requestQuery);
      requestSnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { status: 'Rejected', rejectionReason: reason });
      });
  };

  const followArtist = async (artistId: string, userEmail: string) => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;
      const artistRef = doc(db, 'users', artistId);
      await updateDoc(artistRef, {
          followers: [...artist.followers, userEmail]
      });
  };

  const unfollowArtist = async (artistId: string, userEmail: string) => {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;
      const artistRef = doc(db, 'users', artistId);
      await updateDoc(artistRef, {
          followers: artist.followers.filter(email => email !== userEmail)
      });
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
