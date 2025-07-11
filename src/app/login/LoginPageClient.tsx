
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="h-10 w-10"
      fill="currentColor"
    >
      <path
        d="M83.8,62.8c-0.2-13.3-10.4-24.1-23.3-25.1c-2-8.3-9-14.7-17.7-14.7c-9.2,0-16.9,6.7-18.1,15.7C15.4,40.1,7.2,49,7.2,59.6c0,11.2,9.1,20.3,20.3,20.3h36.1C75,79.9,84,72.4,83.8,62.8z"
        className="text-foreground/80"
      />
      <g className="text-primary">
        <path
          d="M51,68.9c-4.4,0-8-3.6-8-8V47.3c0-4.4,3.6-8,8-8s8,3.6,8,8v13.6C59,65.3,55.4,68.9,51,68.9z"
        />
        <path
          d="M48,49h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M48,55h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M48,61h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M51,68.9v5.8c0,2.6-2.1,4.7-4.7,4.7h-0.6c-2.6,0-4.7-2.1-4.7-4.7v-5.8"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <rect x="44" y="79" width="14" height="4" rx="2" />
      </g>
    </svg>
  );
}

export default function LoginPageClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAdminOrArtist } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdminOrArtist(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Logo />
                <CardTitle className="text-3xl font-headline">Artist & Admin Login</CardTitle>
            </div>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
            <div className="mt-4 text-center text-sm">
              New Artist?{' '}
              <Link href="/artist-register" className="underline hover:text-primary">
                Register here
              </Link>
            </div>
             <div className="mt-4 text-center text-sm">
              Not an artist?{' '}
              <Link href="/user-login" className="underline hover:text-primary">
                Login as a user
              </Link>
            </div>
            <div className="mt-6 text-center">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Homepage
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
