
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User as AuthUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loginAdminOrArtist: (email: string, pass: string) => void;
  loginUser: (email: string, pass: string) => void;
  registerUser: (name: string, email: string, phone: string, pass: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || userData.name,
            role: userData.role,
            profilePictureUrl: firebaseUser.photoURL || userData.profilePictureUrl,
            ...userData
          });
        } else {
            setUser(null);
            await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdminOrArtist = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      let userDoc = await getDoc(userDocRef);

      // If the user document doesn't exist, create it (especially for the admin)
      if (!userDoc.exists() && email === 'admin@cloudstage.live') {
          const adminUserData = {
              uid: firebaseUser.uid,
              name: "Admin",
              email: email,
              role: 'admin' as const,
              createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, adminUserData);
          // Re-fetch the document after creating it
          userDoc = await getDoc(userDocRef); 
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'artist') {
          toast({ title: "Login Successful!" });
           setUser({ // Manually set user to speed up redirect
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || userData.name,
            role: userData.role,
            ...userData
          });
          if (userData.role === 'admin') router.push('/admin');
          if (userData.role === 'artist') router.push('/artist/dashboard');
        } else {
          await signOut(auth);
          toast({ variant: "destructive", title: "Access Denied", description: "This login is for artists and admins only." });
        }
      } else {
        await signOut(auth);
        toast({ variant: "destructive", title: "Login Failed", description: "User data not found. Please contact support." });
      }
    } catch (error: any) {
        console.error("Admin/Artist login error:", error);
        toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials or user not found." });
    }
  };

  const loginUser = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Login Successful!" });
      const redirectTo = sessionStorage.getItem('redirectToAfterLogin');
      if (redirectTo) {
          sessionStorage.removeItem('redirectToAfterLogin');
          router.push(redirectTo);
      } else {
          router.push('/');
      }
    } catch (error: any) {
      console.error("User login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  };

  const registerUser = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { 
        displayName: name,
        photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`
      });

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        name,
        email,
        phone,
        role: 'user',
        profilePictureUrl: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        subscription: null,
      });

      toast({ title: "Registration Successful!", description: "You can now log in." });
       const redirectTo = sessionStorage.getItem('redirectToAfterLogin');
        if (redirectTo) {
            sessionStorage.removeItem('redirectToAfterLogin');
            router.push(redirectTo);
        } else {
            router.push('/');
        }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast({ title: "Logged Out" });
    if(pathname.startsWith('/admin') || pathname.startsWith('/artist') || pathname.startsWith('/profile') || pathname.startsWith('/my-tickets')) {
        router.push('/');
    }
  };

  const contextValue = {
      user: user as AuthUser | null,
      setUser: setUser as (user: AuthUser | null) => void,
      loginAdminOrArtist,
      loginUser,
      registerUser,
      logout,
      isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
