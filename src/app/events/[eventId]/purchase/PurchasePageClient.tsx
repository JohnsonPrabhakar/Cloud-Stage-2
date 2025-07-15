
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEvents } from '@/hooks/useEvents';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, Clock, Mic, ArrowLeft, Loader2, CreditCard, ShieldCheck, PowerOff } from 'lucide-react';
import { useAppStatus } from '@/hooks/useAppStatus';


export default function PurchasePageClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { events } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const { purchaseTicket } = useTickets();
  const { isOnline } = useAppStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const event = events.find(e => e.id === eventId);

  if (!event) {
     return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Event Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The event you are looking for does not exist or has been moved.</p>
              <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
    );
  }

  const handlePurchase = () => {
    if (!isOnline) {
        toast({variant: "destructive", title: "App is Offline", description: "Purchases are temporarily disabled."});
        return;
    }

    if (!user) {
        toast({variant: "destructive", title: "Authentication Error", description: "You must be logged in to purchase a ticket."});
        return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing for paid tickets
    setTimeout(() => {
        purchaseTicket(event.id, user.email);
        toast({
            title: event.ticketPrice > 0 ? "✅ Payment Successful!" : "🎫 Ticket Confirmed!",
            description: `Your ticket for "${event.title}" is confirmed.`,
        });
        router.push(`/events/${event.id}`);
        setIsProcessing(false);
    }, 1500);
  }

  const eventDate = new Date(event.date);

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
          </Button>
        <Card className="max-w-md mx-auto overflow-hidden">
          <Image
              src={event.bannerUrl}
              alt={event.title}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle className="text-2xl font-headline">{event.title}</CardTitle>
            <CardDescription>Confirm your ticket for this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4"/>
                  <span>{event.artist}</span>
              </div>
              <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4"/>
                  <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4"/>
                  <span>{format(eventDate, 'p')}</span>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Price</span>
              <span>{event.ticketPrice > 0 ? `₹${event.ticketPrice.toFixed(2)}` : 'Free'}</span>
            </div>
            
          </CardContent>
            <CardFooter className="flex-col gap-4">
              {isOnline ? (
                <>
                  <Button onClick={handlePurchase} className="w-full" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2"/>}
                      {isProcessing ? 'Processing...' : (event.ticketPrice > 0 ? 'Proceed to Checkout' : 'Get Free Ticket')}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span>Secure and Encrypted Payment</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-destructive p-4 bg-destructive/10 rounded-lg w-full">
                    <PowerOff className="mx-auto h-8 w-8 mb-2" />
                    <h3 className="font-bold">Purchases Offline</h3>
                    <p className="text-sm">The app is currently offline. Please try again later.</p>
                </div>
              )}
            </CardFooter>
        </Card>
      </main>
  );
}
