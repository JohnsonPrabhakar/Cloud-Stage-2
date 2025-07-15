
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User as AuthUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useArtists } from '@/hooks/useArtists';
import { useUsers } from '@/context/UserContext';


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
  const { artists } = useArtists();
  const { users, addUser } = useUsers();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const loginAdminOrArtist = (email: string, pass: string) => {
    // Check for admin
    if (email === 'admin@cloudstage.live' && pass === 'PASSWORD') {
      const loggedInUser: AuthUser = { email, role: 'admin', name: 'Admin User' };
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      router.push('/admin');
      return;
    }
    
    // Check for artists
    const artist = artists.find(a => a.email === email);
    if (artist && (pass === 'PASSWORD' || pass === artist.password)) {
        const loggedInUser: AuthUser = { 
            email, 
            role: 'artist', 
            name: artist.name,
            profilePictureUrl: artist.profilePictureUrl
        };
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        router.push('/artist/dashboard');
        return;
    }

    toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
    });
  };

  const loginUser = (email: string, pass: string) => {
    const registeredUser = users.find(u => u.email === email);
    if(registeredUser && registeredUser.password === pass) {
        const loggedInUser: AuthUser = { 
            name: registeredUser.name,
            email: registeredUser.email,
            phone: registeredUser.phone,
            role: 'user',
            profilePictureUrl: registeredUser.profilePictureUrl
        };
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        
        const redirectTo = sessionStorage.getItem('redirectToAfterLogin');
        if (redirectTo) {
            sessionStorage.removeItem('redirectToAfterLogin');
            router.push(redirectTo);
        } else {
            router.push('/');
        }
        return;
    }

    toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid user credentials. Please check your email and password.",
    });
  };


  const registerUser = (name: string, email: string, phone: string, pass: string) => {
      const existingUser = users.find(u => u.email === email);
      if(existingUser) {
          toast({
              variant: "destructive",
              title: "Registration Failed",
              description: "An account with this email already exists.",
          });
          return;
      }
      
      const newUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          phone,
          password: pass,
          profilePictureUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`
      };
      addUser(newUser);
      
      toast({
          title: "Registration Successful!",
          description: "You can now log in with your credentials.",
      });

      // Automatically log the user in
      const loggedInUser: AuthUser = { 
          name: newUser.name, 
          email: newUser.email, 
          phone: newUser.phone, 
          role: 'user',
          profilePictureUrl: newUser.profilePictureUrl
      };
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      const redirectTo = sessionStorage.getItem('redirectToAfterLogin');
      if (redirectTo) {
          sessionStorage.removeItem('redirectToAfterLogin');
          router.push(redirectTo);
      } else {
          router.push('/');
      }
  };


  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    if(pathname.startsWith('/admin') || pathname.startsWith('/artist')) {
        router.push('/');
    } else {
        // Optional: force a reload to clear state if needed on public pages
        // router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginAdminOrArtist, loginUser, registerUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
