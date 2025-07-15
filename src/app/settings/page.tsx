
'use client';

import Header from '@/components/layout/Header';
import SettingsPageClient from './SettingsPageClient';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
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
            <SettingsPageClient />
        </>
    );
}
