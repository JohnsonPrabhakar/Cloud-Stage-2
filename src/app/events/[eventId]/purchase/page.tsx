
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';
import { useEffect } from 'react';

export default function PurchasePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
        sessionStorage.setItem('redirectToAfterLogin', pathname);
        router.push('/user-login');
    }
  }, [user, isLoading, router, pathname]);
  
  if (isLoading || !user) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
      )
  }

  return (
    <>
      <Header />
      <PurchasePageClient eventId={eventId} />
    </>
  );
}
