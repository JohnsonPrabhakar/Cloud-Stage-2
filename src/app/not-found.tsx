
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Optional: redirect after a delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
        <Header />
        <main className="container flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-6xl font-bold font-headline text-primary">404</h1>
            <h2 className="mt-4 text-3xl font-semibold">Page Not Found</h2>
            <p className="mt-2 text-muted-foreground">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                You will be redirected to the homepage shortly.
            </p>
            <div className="mt-6">
                <Button onClick={() => router.push('/')}>Go Back Home</Button>
            </div>
        </main>
    </>
  );
}
