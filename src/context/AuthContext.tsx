
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
    const ensureAdminExists = async () => {
        // This is a simplified check. A more robust system might use a specific document ID for the admin.
        const adminEmail = "admin@cloudstage.live";
        const adminDocRef = doc(db, "users", "admin_user_placeholder_uid"); // Use a predictable ID to check

        try {
            const adminDoc = await getDoc(adminDocRef);
            if (!adminDoc.exists()) {
                // Admin does not exist, so create it.
                // NOTE: This creates a placeholder user in auth. A real app would have a more secure setup process.
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, "admin123");
                    const firebaseUser = userCredential.user;
                    
                    const adminUserData = {
                        uid: firebaseUser.uid,
                        name: "Admin",
                        email: adminEmail,
                        role: 'admin' as const,
                        createdAt: serverTimestamp(),
                    };
                    
                    // Use the actual UID for the document now.
                    await setDoc(doc(db, "users", firebaseUser.uid), adminUserData);
                    console.log("Default admin account created successfully.");
                    // Log out the newly created user immediately so they can log in normally.
                    await signOut(auth);
                } catch(error: any) {
                    if (error.code !== 'auth/email-already-in-use') {
                       console.error("Failed to create default admin:", error);
                    }
                    // If email is in use, we assume the user doc exists or will be found by onAuthStateChanged.
                }
            }
        } catch (e) {
             console.error("Error checking for admin user:", e);
        }
    };

    ensureAdminExists();

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
            // This can happen if a user is deleted from Firestore but not Auth
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
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'artist') {
          toast({ title: "Login Successful!" });
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
