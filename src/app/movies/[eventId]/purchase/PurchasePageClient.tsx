'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, CreditCard, Mic, Tag, ArrowLeft } from 'lucide-react';

const purchaseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().min(10, "Please enter a valid mobile number."),
});
type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export default function PurchasePageClient({ event }: { event: Event | undefined }) {
  const router = useRouter();
  const { purchaseTicket } = useTickets();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: ''
    }
  });

  if (!event) {
    return (
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
        </div>
    );
  }

  const eventId = event.id;

  function onSubmit(data: PurchaseFormValues) {
    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
        purchaseTicket(eventId, data.email);
        toast({
            title: "Ticket Confirmed!",
            description: `Your ticket for "${event?.title}" has been confirmed.`
        });
        router.push(`/movies/${eventId}`);
        setIsProcessing(false);
    }, 2000);
  }

  return (
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Confirm Your Ticket</CardTitle>
              <CardDescription>You're about to purchase a ticket for the event below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <Image src={event.bannerUrl} alt={event.title} width={200} height={112} className="rounded-lg aspect-video object-cover"/>
                <div className="space-y-2">
                    <h2 className="text-2xl font-headline">{event.title}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Mic className="w-4 h-4"/> <span>{event.artist}</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4"/> <span>{format(new Date(event.date), 'EEE, MMM d, yyyy')}</span>
                    </div>
                     <div className="flex items-center gap-2 font-bold text-lg">
                        <Tag className="w-4 h-4"/> <span>{event.ticketPrice > 0 ? `Price: $${event.ticketPrice}` : 'Free'}</span>
                    </div>
                </div>
              </div>
            
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl><Input placeholder="Your Mobile Number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full text-lg py-6 bg-primary" disabled={isProcessing}>
                        <CreditCard className="mr-2"/>
                        {isProcessing ? 'Processing Payment...' : (event.ticketPrice > 0 ? `Pay $${event.ticketPrice}` : 'Confirm Free Ticket')}
                    </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
