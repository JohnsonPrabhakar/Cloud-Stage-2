'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, Clock, Mic, ArrowLeft } from 'lucide-react';

export default function PurchasePageClient({ event }: { event: Event | undefined }) {
  const { user, isLoading } = useAuth();
  const { purchaseTicket } = useTickets();
  const { toast } = useToast();
  const router = useRouter();

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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "You need to be logged in to get a ticket.",
      });
      router.push('/login');
      return;
    }
    purchaseTicket(event.id, user.email);
    toast({
      title: "Success!",
      description: `You've got a ticket for "${event.title}".`,
    });
    router.push(`/events/${event.id}`);
  };

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
            <span>{event.ticketPrice > 0 ? `$${event.ticketPrice.toFixed(2)}` : 'Free'}</span>
          </div>
          <Button onClick={handlePurchase} className="w-full mt-6" disabled={isLoading}>
            <Ticket className="mr-2" />
            {event.ticketPrice > 0 ? 'Confirm Purchase' : 'Get Free Ticket'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
