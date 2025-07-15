
'use client';

import Header from '@/components/layout/Header';
import ProfilePageClient from './ProfilePageClient';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if(!isLoading && !user) {
            router.push('/user-login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <ProfilePageClient />
        </>
    );
}
