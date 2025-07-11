
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/hooks/useTickets';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import type { Event, GuestDetails } from '@/lib/types';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

export default function MockPaymentPage() {
  const router = useRouter();
  const { purchaseTicket } = useTickets();
  const { events } = useEvents();
  const { toast } = useToast();

  const [guestDetails, setGuestDetails] = useState<GuestDetails | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const detailsString = sessionStorage.getItem('guestDetails');
    const eventId = sessionStorage.getItem('eventIdToPurchase');
    
    if (detailsString && eventId) {
      setGuestDetails(JSON.parse(detailsString));
      const foundEvent = events.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        // Event not found, redirect
        toast({ variant: "destructive", title: "Error", description: "Event details not found." });
        router.push('/events');
      }
    } else {
      // No details, redirect
      toast({ variant: "destructive", title: "Error", description: "Checkout details missing." });
      router.push('/events');
    }
  }, [events, router, toast]);

  const handlePayment = () => {
    if (!guestDetails || !event) return;

    setIsProcessing(true);
    setTimeout(() => {
      purchaseTicket(event.id, guestDetails.email, guestDetails);
      
      // Clean up session storage
      sessionStorage.removeItem('guestDetails');
      sessionStorage.removeItem('eventIdToPurchase');

      toast({
        title: "✅ Payment Successful!",
        description: `Your ticket for "${event.title}" is confirmed.`,
      });
      
      router.push(`/events/${event.id}`);
    }, 2000); // Simulate network delay
  };

  if (!event || !guestDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8 md:py-12 px-4 md:px-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Secure Checkout</CardTitle>
            <CardDescription>You are purchasing a ticket for "{event.title}".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-muted-foreground">Billed To</h3>
              <p>{guestDetails.name}</p>
              <p>{guestDetails.email}</p>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Amount to Pay</span>
              <span>${event.ticketPrice.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground text-center pt-2">
                This is a mock payment screen. No real transaction will occur.
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button 
                className="w-full" 
                onClick={handlePayment} 
                disabled={isProcessing}
            >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2" />}
                {isProcessing ? 'Processing Payment...' : 'Pay Now'}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Secure and Encrypted Payment</span>
            </div>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
