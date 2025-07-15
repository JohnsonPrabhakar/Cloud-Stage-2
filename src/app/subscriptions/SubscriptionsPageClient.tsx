
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Star, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPageClient() {
    const { toast } = useToast();
    const { user, setUser } = useAuth(); // We need setUser to update the auth context state
    const { subscribeUser } = useUsers();
    const router = useRouter();

    const handleSubscribe = () => {
        if (!user) {
            router.push('/user-login');
            return;
        }
        
        subscribeUser(user.email);
        
        // Optimistically update the user in the auth context to reflect subscription immediately
        const now = new Date();
        const updatedUser = {
            ...user,
            subscription: {
                planType: 'premium',
                startDate: now.toISOString(),
                expiryDate: new Date(now.setDate(now.getDate() + 30)).toISOString(),
                eventCount: 0,
            }
        };
        setUser(updatedUser as any); // Update user in AuthContext

        toast({
            title: "✅ Premium Plan Activated!",
            description: "20 events unlocked for 30 days!",
        });
    };

    const hasActiveSubscription = user?.subscription && new Date(user.subscription.expiryDate) > new Date();

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
            <div className="space-y-4 text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">Choose Your Plan</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Unlock the best of CloudStage with a Premium subscription.
                </p>
            </div>

            <div className="flex justify-center">
                 <Card className="w-full max-w-sm border-primary shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Premium Plan</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">₹299</span>
                            <span className="text-muted-foreground">/ month</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start">
                                <Ticket className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>Access any <strong>20 events</strong> per month</span>
                            </li>
                             <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>Valid for <strong>30 days</strong> from subscription date</span>
                            </li>
                             <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>HD & 4K streaming quality</span>
                            </li>
                             <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>Ad-free experience</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            onClick={handleSubscribe}
                            disabled={hasActiveSubscription}
                        >
                            {hasActiveSubscription ? 'Your Current Plan' : 'Subscribe Now'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
